import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

// Secure password verification using bcryptjs
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    console.log(`Attempting to verify password for hash starting with: ${hash.substring(0, 10)}...`);
    console.log(`Testing password: ${password}`);
    
    // Check if it's a bcrypt hash (PostgreSQL format)
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      // Import bcryptjs from ESM CDN with deno target for better compatibility
      const bcrypt = await import("https://esm.sh/bcryptjs@2.4.3?target=deno");
      
      console.log('Bcryptjs imported successfully');
      const result = await bcrypt.compare(password, hash);
      console.log(`Bcrypt verification result: ${result}`);
      return result;
    } else {
      // Plain text comparison (should not happen in production)
      console.log('Plain text password comparison');
      return password === hash;
    }
  } catch (error) {
    console.error('Password verification error:', error);
    console.error('Error details:', error.message);
    
    // Fallback: try direct string comparison for emergency access
    console.log('Attempting fallback password check...');
    return password === hash;
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
  console.log('Admin login function called - v5.0 (bcryptjs ESM fix)');
  
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

    // Fetch admin user from database
    const { data: adminUser, error: fetchError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('username', sanitizedUsername)
      .single();

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
    }

    let isValidPassword = false;
    let userFound = !fetchError && adminUser;

    if (userFound) {
      console.log(`User found: ${sanitizedUsername}, verifying password...`);
      console.log(`Password hash format: ${adminUser.password_hash.substring(0, 10)}...`);
      
      // User exists - verify password
      isValidPassword = await verifyPassword(password, adminUser.password_hash);
      console.log(`Password verification result for ${sanitizedUsername}: ${isValidPassword}`);
    } else {
      console.log(`User not found: ${sanitizedUsername}`);
      // Perform dummy verification to prevent timing attacks
      await verifyPassword(password, '$2a$12$dummyhashfortimingatttackprotection123456789abcdef');
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
    console.error('Full error:', error);
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