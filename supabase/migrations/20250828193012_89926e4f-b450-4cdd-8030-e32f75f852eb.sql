-- Create password reset token for lekhna.kumaraswamy@ucop.edu
INSERT INTO public.password_reset_tokens (email, token, expires_at)
VALUES (
  'lekhna.kumaraswamy@ucop.edu',
  'temp-reset-token-lekhna',
  NOW() + INTERVAL '24 hours'
);