-- Creates a trigger that fires after a new user is created in the auth.users table.
-- This trigger creates a corresponding entry in the public.users table.
-- It's now more robust, handling cases where user metadata might be missing.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'), -- Default name if not provided
    (COALESCE(new.raw_user_meta_data->>'role', 'EMPLOYEE'))::character varying, -- Default role if not provided
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To ensure this script can be re-run, we drop the trigger if it already exists.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
