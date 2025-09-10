import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginRequest {
  username: string;
  password: string;
}

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { attempts: number; lastAttempt: number }>();

// Security constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_INPUT_LENGTH = 128;
const BCRYPT_ROUNDS = parseInt(Deno.env.get('BCRYPT_ROUNDS') ?? '12');

// Dummy hash for timing attack protection (valid bcrypt format)
const DUMMY_HASH = '$2a$12$dummyhashfortimingatttackprotection123456789abcdef';

// Secure password hashing using bcrypt
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Secure password verification using bcrypt
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Check if it's a bcrypt hash (PostgreSQL format)
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      const bcrypt = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
      return await bcrypt.compare(password, hash);
    } else if (hash.length > 20) {
      // Web Crypto hash (legacy)
      const encoder = new TextEncoder();
      const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
      const salt = combined.slice(0, 16);
      const storedHash = combined.slice(16);
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );
      
      const hashArray = new Uint8Array(hashBuffer);
      return hashArray.every((byte, index) => byte === storedHash[index]);
    } else {
      // Plain text - direct comparison (for migration only)
      return password === hash;
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Input validation and sanitization
function validateInput(username: string, password: string): { isValid: boolean; error?: string } {
  if (!username || !password) {
    return { isValid: false, error: 'Username and password are required' };
  }
  
  if (username.length > MAX_INPUT_LENGTH || password.length > MAX_INPUT_LENGTH) {
    return { isValid: false, error: 'Input too long' };
  }
  
  // Sanitize username (trim whitespace)
  const sanitizedUsername = username.trim();
  if (sanitizedUsername.length === 0) {
    return { isValid: false, error: 'Invalid username' };
  }
  
  return { isValid: true };
}

// Rate limiting check
function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record) {
    rateLimitStore.set(identifier, { attempts: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // Reset if lockout period has passed
  if (now - record.lastAttempt > LOCKOUT_DURATION) {
    rateLimitStore.set(identifier, { attempts: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // Check if locked out
  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    const retryAfter = Math.ceil((LOCKOUT_DURATION - (now - record.lastAttempt)) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Increment attempts
  record.attempts++;
  record.lastAttempt = now;
  rateLimitStore.set(identifier, record);
  
  return { allowed: true };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Admin login function called - v3.0 (security hardened)');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { username, password }: LoginRequest = await req.json();

    // Input validation
    const validation = validateInput(username, password);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const sanitizedUsername = username.trim();

    // Rate limiting check
    const rateLimit = checkRateLimit(`${clientIP}:${sanitizedUsername}`);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many login attempts. Try again later.',
          retryAfter: rateLimit.retryAfter 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': rateLimit.retryAfter?.toString() ?? '900'
          } 
        }
      );
    }

    console.log(`Admin login attempt for username: ${sanitizedUsername}`);
    // SECURITY: Never log passwords or hashes

    // Fetch admin user from database
    const { data: adminUser, error: fetchError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('username', sanitizedUsername)
      .single();

    let isValidPassword = false;
    let userFound = !fetchError && adminUser;

    if (userFound) {
      // User exists - verify password
      isValidPassword = await verifyPassword(password, adminUser.password_hash);
      
      // If plain text password was verified, hash it for future use
      if (isValidPassword && !adminUser.password_hash.startsWith('$') && adminUser.password_hash.length < 50) {
        console.log('Upgrading plain text password to secure hash');
        const hashedPassword = await hashPassword(password);
        
        await supabaseClient
          .from('admin_users')
          .update({ password_hash: hashedPassword })
          .eq('username', sanitizedUsername);
      }
    } else {
      // User doesn't exist - perform dummy verification to prevent timing attacks
      console.log('User not found - performing dummy verification');
      await verifyPassword(password, DUMMY_HASH);
    }

    if (!isValidPassword || !userFound) {
      console.log(`Authentication failed for: ${sanitizedUsername}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid credentials' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Admin login successful for: ${sanitizedUsername}`);
    
    // Reset rate limit on successful login
    rateLimitStore.delete(`${clientIP}:${sanitizedUsername}`);

    // Return successful authentication with user data (excluding sensitive fields)
    const { password_hash, password_salt, ...safeAdminUser } = adminUser;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        adminUser: safeAdminUser 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in admin-login function:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Authentication failed' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);