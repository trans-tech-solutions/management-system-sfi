-- Script to create your first admin user
-- After running the main schema script, you'll need to create a user manually

-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add User"
-- 4. Enter the email and password for your admin user
-- 5. The user will be created and can immediately access the system

-- Alternative: Use this SQL to create a user programmatically
-- Note: Replace 'your-email@example.com' and 'your-secure-password' with actual values

-- This is just for reference. In Supabase, it's recommended to use the Dashboard or 
-- the Auth API to create users rather than direct SQL inserts into auth.users

-- Example using Supabase Auth API (run this in a Node.js script or from browser console):
/*
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@sucataoforteitaguai.com.br',
  password: 'SuaSenhaSegura123!',
  email_confirm: true
})
*/

-- For this internal system, since we enabled RLS with policies that allow all operations,
-- any authenticated user can access and manage all data.
-- This is appropriate for a small internal system with trusted users.
