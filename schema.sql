-- Tabela de Lojas
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    logo_url TEXT,
    cover_url TEXT,
    floor VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários (Funcionários, Gerentes, Admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id), -- Null se for Admin do Shopping
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Cupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_usage INTEGER, -- Quantidade total disponível
    current_usage INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1, -- Limite de resgates por usuário
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Regras do Cupom (Opcional, normalização para listas de regras)
CREATE TABLE coupon_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    rule_text TEXT NOT NULL
);

-- Tabela de Resgates (Carteira do Funcionário)
CREATE TABLE redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id),
    user_id UUID REFERENCES users(id),
    unique_code VARCHAR(50) UNIQUE NOT NULL, -- O código para o QR Code
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VALIDATED', 'EXPIRED')),
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_coupons_store ON coupons(store_id);
CREATE INDEX idx_coupons_validity ON coupons(end_date);
CREATE INDEX idx_redemptions_user ON redemptions(user_id);