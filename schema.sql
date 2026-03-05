-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.coupon_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coupon_id uuid,
  rule_text text NOT NULL,
  CONSTRAINT coupon_rules_pkey PRIMARY KEY (id),
  CONSTRAINT coupon_rules_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id)
);
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  discount_type character varying CHECK (discount_type::text = ANY (ARRAY['PERCENTAGE'::character varying, 'FIXED'::character varying]::text[])),
  discount_value numeric NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  max_usage integer,
  current_usage integer DEFAULT 0,
  max_uses_per_user integer DEFAULT 1,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT coupons_pkey PRIMARY KEY (id),
  CONSTRAINT coupons_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coupon_id uuid,
  user_id uuid,
  unique_code character varying NOT NULL UNIQUE,
  status character varying DEFAULT 'PENDING'::character varying CHECK (status::text = ANY (ARRAY['PENDING'::character varying, 'USED'::character varying, 'EXPIRED'::character varying]::text[])),
  redeemed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  validated_at timestamp with time zone,
  CONSTRAINT redemptions_pkey PRIMARY KEY (id),
  CONSTRAINT redemptions_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id),
  CONSTRAINT redemptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  category character varying NOT NULL,
  logo_url text,
  cover_url text,
  floor character varying,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT stores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  store_id uuid,
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  role character varying CHECK (role::text = ANY (ARRAY['ADMIN'::character varying, 'MANAGER'::character varying, 'EMPLOYEE'::character varying]::text[])),
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  avatar_url text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT users_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);