import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gmail access token retrieval - matching other functions
const getGmailAccessToken = async () => {
  const clientId = Deno.env.get("GMAIL_CLIENT_ID");
  const clientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN");

  console.log('Attempting to get Gmail access token...');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: refreshToken!,
        grant_type: "refresh_token",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    console.log('Gmail access token retrieved successfully');
    return data.access_token;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Failed to get Gmail access token:', error);
    throw new Error(`Failed to get Gmail access token: ${error.message}`);
  }
};

// Gmail email sending function - matching other functions
const sendGmailEmail = async (accessToken: string, to: string, subject: string, htmlContent: string) => {
  const fromEmail = Deno.env.get("GMAIL_USER") || "noreply@ucinvestmentacademy.com";
  
  console.log(`Preparing to send email to: ${to} from: ${fromEmail}`);

  const emailContent = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    htmlContent,
  ].join("\n");

  const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  console.log('Sending email via Gmail API...');

  try {
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: encodedEmail,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gmail API error: ${response.status} - ${errorText}`);
      throw new Error(`Gmail API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Gmail API:', result);
    return result;
  } catch (error) {
    console.error('Error sending email via Gmail API:', error);
    throw error;
  }
};

// Crypto utilities for password hashing - matching admin-login function
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
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
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const saltArray = Array.from(salt);
  const combined = saltArray.concat(hashArray);
  return btoa(String.fromCharCode.apply(null, combined));
}

interface CreateAdminRequest {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('create-admin-user function called');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { username, full_name, email, password }: CreateAdminRequest = await req.json();
    console.log('Creating admin user:', { username, full_name, email });

    // Hash the password using the same method as admin-login
    const hashedPassword = await hashPassword(password);

    // Insert new admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        username,
        full_name,
        email,
        password_hash: hashedPassword
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ success: false, error: 'Username or email already exists' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      throw new Error('Failed to create administrator');
    }

    console.log('Admin user created successfully:', data.id);

    // Send admin invitation email using Gmail
    try {
      console.log('Sending admin invite email to:', email);
      const accessToken = await getGmailAccessToken();
      
      // Generate temporary password for the new admin
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Update the admin user with temporary password
      await supabase
        .from('admin_users')
        .update({ temp_password: tempPassword })
        .eq('id', data.id);

      // Construct login URL - use proper domain construction
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const baseUrl = supabaseUrl.includes('supabase.co') 
        ? `https://${supabaseUrl.split('.supabase.co')[0].split('://')[1]}.lovableproject.com`
        : supabaseUrl.replace('/supabase', '');
      const loginUrl = `${baseUrl}/admin/auth`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Administrator Account Created</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .login-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to UC Investment Academy</h1>
              <p>Your administrator account has been created!</p>
            </div>
            <div class="content">
              <h2>Hello ${full_name}!</h2>
              <p>You have been added as an administrator for the UC Investment Academy platform. Below are your login credentials:</p>
              
              <div class="credentials">
                <h3>📋 Your Login Details</h3>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>

              <p>🔐 <strong>Important:</strong> Please change your password immediately after logging in for security purposes.</p>

              <div style="text-align: center;">
                <a href="${loginUrl}" class="login-button">🚀 Login to Admin Dashboard</a>
              </div>

              <h3>🎯 What you can do as an administrator:</h3>
              <ul>
                <li>✅ Manage user applications and approvals</li>
                <li>📊 Access comprehensive analytics and reports</li>
                <li>🎓 Manage certification programs</li>
                <li>📅 Oversee calendar events and scheduling</li>
                <li>👥 Handle user management and permissions</li>
                <li>🌐 Update website content and settings</li>
              </ul>

              <div class="footer">
                <p>If you have any questions or need assistance, please don't hesitate to reach out.</p>
                <p><strong>UC Investment Academy Team</strong><br>
                Building the future of financial education</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendGmailEmail(accessToken, email, 'UC Investment Academy - Administrator Access Granted', htmlContent);
      console.log('Admin invitation email sent successfully');
    } catch (emailError) {
      console.error('Error sending admin invitation email:', emailError);
      // Don't fail the entire request if email fails
    }

    return new Response(
      JSON.stringify({ success: true, adminUser: data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in create-admin-user function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);