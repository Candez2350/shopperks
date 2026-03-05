-- =============================================================================
-- ShopPerks RLS Policies
--
-- Este script configura a Row-Level Security (RLS) para as tabelas da aplicação.
-- RLS garante que os usuários só possam acessar e modificar os dados que 
-- eles têm permissão para ver ou alterar.
--
-- Execute este script uma vez no seu editor de SQL do Supabase.
-- =============================================================================


-- =============================================================================
-- Helper Functions
-- =============================================================================

-- Esta função recupera o id, role e store_id do usuário atualmente autenticado.
-- Será usada nas políticas de RLS para verificar as permissões.
CREATE OR REPLACE FUNCTION get_current_user_claims()
RETURNS TABLE(id uuid, role text, store_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.role::text,
    u.store_id
  FROM public.users u
  WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- RLS Policies for STORES
-- =============================================================================

-- 1. Habilitar RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas para evitar duplicatas
DROP POLICY IF EXISTS "Admins can manage stores" ON public.stores;
DROP POLICY IF EXISTS "Authenticated users can view stores" ON public.stores;

-- 3. Criar novas políticas
-- Admins têm acesso total para criar, ler, atualizar e deletar lojas.
CREATE POLICY "Admins can manage stores"
ON public.stores
FOR ALL
USING ((SELECT role FROM get_current_user_claims()) = 'ADMIN')
WITH CHECK ((SELECT role FROM get_current_user_claims()) = 'ADMIN');

-- Qualquer usuário autenticado pode visualizar as lojas.
CREATE POLICY "Authenticated users can view stores"
ON public.stores
FOR SELECT
TO authenticated
USING (true);


-- =============================================================================
-- RLS Policies for USERS
-- =============================================================================

-- 1. Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON public.users;

-- 3. Criar novas políticas
-- Usuários podem visualizar seu próprio perfil.
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (id = auth.uid());
-- Usuários podem atualizar seu próprio perfil.
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
-- Admins podem gerenciar todos os usuários.
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING ((SELECT role FROM get_current_user_claims()) = 'ADMIN');
-- Usuários autenticados podem ver os outros usuários (para listas, etc.).
CREATE POLICY "Authenticated users can view all users" ON public.users FOR SELECT TO authenticated USING (true);

-- =============================================================================
-- RLS Policies for COUPONS
-- =============================================================================

-- 1. Habilitar RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas
DROP POLICY IF EXISTS "Admins can manage all coupons" ON public.coupons;
DROP POLICY IF EXISTS "Managers can manage their store's coupons" ON public.coupons;
DROP POLICY IF EXISTS "Authenticated users can view coupons" ON public.coupons;

-- 3. Criar novas políticas
-- Admins têm acesso total.
CREATE POLICY "Admins can manage all coupons"
ON public.coupons FOR ALL
USING ((SELECT role FROM get_current_user_claims()) = 'ADMIN')
WITH CHECK ((SELECT role FROM get_current_user_claims()) = 'ADMIN');

-- Gerentes podem gerenciar os cupons de sua própria loja.
CREATE POLICY "Managers can manage their store's coupons"
ON public.coupons FOR ALL
USING (store_id = (SELECT store_id FROM get_current_user_claims()) AND (SELECT role FROM get_current_user_claims()) = 'MANAGER')
WITH CHECK (store_id = (SELECT store_id FROM get_current_user_claims()));

-- Usuários autenticados podem visualizar todos os cupons.
CREATE POLICY "Authenticated users can view coupons"
ON public.coupons FOR SELECT
TO authenticated
USING (true);


-- =============================================================================
-- RLS Policies for REDEMPTIONS
-- =============================================================================

-- 1. Habilitar RLS
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas
DROP POLICY IF EXISTS "Admins can manage all redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "Users can create their own redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "Managers can validate redemptions in their store" ON public.redemptions;

-- 3. Criar novas políticas
-- Admins têm acesso total.
CREATE POLICY "Admins can manage all redemptions"
ON public.redemptions FOR ALL USING ((SELECT role FROM get_current_user_claims()) = 'ADMIN');

-- Usuários podem criar (INSERT) seus próprios resgates.
CREATE POLICY "Users can create their own redemptions"
ON public.redemptions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Usuários podem visualizar (SELECT) seus próprios resgates.
CREATE POLICY "Users can view their own redemptions"
ON public.redemptions FOR SELECT
USING (user_id = auth.uid());

-- Gerentes podem visualizar e atualizar os resgates relacionados à sua loja.
CREATE POLICY "Managers can validate redemptions in their store"
ON public.redemptions FOR ALL -- Mantido como ALL por simplicidade, pode ser refinado para SELECT, UPDATE
USING ((SELECT role FROM get_current_user_claims()) = 'MANAGER' AND coupon_id IN (SELECT id FROM public.coupons WHERE store_id = (SELECT store_id FROM get_current_user_claims())));
