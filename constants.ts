import { Store, Coupon, User, UserRole, Redemption } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Ana Silva',
  email: 'ana@shopp.com',
  role: UserRole.EMPLOYEE,
  storeId: 's2',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
};

export const USERS: User[] = [
  CURRENT_USER,
  {
    id: 'admin1',
    name: 'Administrador Shopping',
    email: 'admin@shopp.com',
    role: UserRole.ADMIN,
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
  },
  {
    id: 'mgr1',
    name: 'Zara Manager',
    email: 'zara@shopp.com',
    role: UserRole.MANAGER,
    storeId: 's2',
    avatarUrl: 'https://i.pravatar.cc/150?u=zara',
  },
  {
    id: 'mgr2',
    name: 'Carlos BK',
    email: 'carlos@bk.com',
    role: UserRole.MANAGER,
    storeId: 's1',
    avatarUrl: 'https://i.pravatar.cc/150?u=carlos',
  },
  {
    id: 'u2',
    name: 'Roberto Souza',
    email: 'roberto@shopp.com',
    role: UserRole.EMPLOYEE,
    storeId: 's3',
    avatarUrl: 'https://i.pravatar.cc/150?u=roberto',
  },
  {
    id: 'u3',
    name: 'Julia Lima',
    email: 'julia@shopp.com',
    role: UserRole.EMPLOYEE,
    storeId: 's4',
    avatarUrl: 'https://i.pravatar.cc/150?u=julia',
  }
];

export const STORES: Store[] = [
  {
    id: 's1',
    name: 'Burger King',
    category: 'Alimentação',
    floor: 'L3',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Burger_King_logo_%281999%29.svg',
    coverUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 's2',
    name: 'Zara',
    category: 'Moda',
    floor: 'L2',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg',
    coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 's3',
    name: 'Centauro',
    category: 'Esportes',
    floor: 'L1',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Centauro_logo.svg/2560px-Centauro_logo.svg.png',
    coverUrl: 'https://images.unsplash.com/photo-1556906781-9a412961d28c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 's4',
    name: 'Kopenhagen',
    category: 'Alimentação',
    floor: 'L2',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Kopenhagen_logo.svg/1200px-Kopenhagen_logo.svg.png',
    coverUrl: 'https://images.unsplash.com/photo-1511381978829-2c7a7261d766?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 's5',
    name: 'Cinemark',
    category: 'Serviços',
    floor: 'L4',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Cinemark_logo.svg',
    coverUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 's6',
    name: 'Sephora',
    category: 'Moda',
    floor: 'L2',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sephora_logo.svg/2560px-Sephora_logo.svg.png',
    coverUrl: 'https://images.unsplash.com/photo-1522335789203-abd65381a17c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  }
];

export const COUPONS: Coupon[] = [
  // Burger King
  {
    id: 'c1',
    storeId: 's1',
    title: 'Combo Whopper 50% OFF',
    description: 'Aproveite o clássico Whopper com batata e refil de refrigerante pela metade do preço. Exclusivo para funcionários uniformizados.',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    expiryDate: '2023-12-31',
    category: 'Alimentação',
    availableQuantity: 150,
    maxUsesPerUser: 1, // Limite 1
    rules: ['Válido apenas de segunda a quinta.', 'Obrigatório apresentar crachá.', 'Não cumulativo.']
  },
  {
    id: 'c4',
    storeId: 's1',
    title: 'Sundae em Dobro',
    description: 'Compre um Sundae e ganhe outro do mesmo sabor.',
    discountType: 'PERCENTAGE',
    discountValue: 100,
    expiryDate: '2023-10-30',
    category: 'Alimentação',
    availableQuantity: 45,
    maxUsesPerUser: 2,
    rules: ['Sabores: Chocolate, Morango ou Caramelo.']
  },
  
  // Centauro
  {
    id: 'c2',
    storeId: 's3',
    title: 'R$ 50,00 em Tênis de Corrida',
    description: 'Desconto aplicável em qualquer tênis da linha running acima de R$ 200,00.',
    discountType: 'FIXED',
    discountValue: 50,
    expiryDate: '2023-11-20',
    category: 'Esportes',
    availableQuantity: 20,
    maxUsesPerUser: 1,
    rules: ['Válido para marcas selecionadas (Nike, Adidas, Asics).', 'Um uso por CPF.']
  },

  // Kopenhagen
  {
    id: 'c3',
    storeId: 's4',
    title: 'Café Expresso Grátis',
    description: 'Na compra de qualquer chocolate, ganhe um café expresso pequeno.',
    discountType: 'PERCENTAGE',
    discountValue: 100,
    expiryDate: '2023-12-15',
    category: 'Alimentação',
    availableQuantity: 500,
    maxUsesPerUser: 5,
    rules: ['Válido todos os dias até as 14h.']
  },

  // Cinemark
  {
    id: 'c5',
    storeId: 's5',
    title: 'Ingresso 2D por R$ 15,00',
    description: 'Válido para qualquer sessão 2D de segunda a quarta-feira.',
    discountType: 'FIXED',
    discountValue: 15,
    expiryDate: '2023-12-01',
    category: 'Serviços',
    availableQuantity: 100,
    maxUsesPerUser: 4,
    rules: ['Não válido para salas XD ou Prime.', 'Máximo de 2 ingressos por sessão.']
  },

  // Sephora
  {
    id: 'c6',
    storeId: 's6',
    title: '15% OFF em Perfumaria',
    description: 'Desconto especial em perfumes importados selecionados.',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    expiryDate: '2023-11-15',
    category: 'Moda',
    availableQuantity: 50,
    maxUsesPerUser: 1,
    rules: ['Válido para compras acima de R$ 250,00.']
  },
  
  // Zara
  {
    id: 'c7',
    storeId: 's2',
    title: 'Peças da Coleção Anterior com 70% OFF',
    description: 'Acesso antecipado ao saldo da coleção de inverno.',
    discountType: 'PERCENTAGE',
    discountValue: 70,
    expiryDate: '2023-10-05', // Expirado para teste
    category: 'Moda',
    availableQuantity: 10,
    maxUsesPerUser: 1,
    rules: ['Apenas peças com etiqueta vermelha.']
  }
];

export const MY_REDEMPTIONS: Redemption[] = [
  // User 1 (Ana) Redemptions
  {
    id: 'r1',
    couponId: 'c1',
    userId: 'u1',
    code: 'CPN-XK92MZ',
    status: 'USED',
    redeemedAt: '2023-10-01T14:30:00Z',
    validatedBy: 'Carlos BK',
    validatedAt: '2023-10-01T14:35:00Z'
  },
  {
    id: 'r2',
    couponId: 'c3',
    userId: 'u1',
    code: 'CPN-LP99QQ',
    status: 'PENDING',
    redeemedAt: '2023-10-26T09:15:00Z'
  },
  {
    id: 'r3',
    couponId: 'c5',
    userId: 'u1',
    code: 'CPN-MV55TR',
    status: 'PENDING', // Perto de expirar para teste de notificação
    redeemedAt: '2023-10-25T18:00:00Z'
  },
  {
    id: 'r4',
    couponId: 'c4',
    userId: 'u1',
    code: 'CPN-DBL111',
    status: 'USED',
    redeemedAt: '2023-10-10T12:00:00Z',
    validatedBy: 'Carlos BK',
    validatedAt: '2023-10-10T12:05:00Z'
  },
  {
    id: 'r5',
    couponId: 'c4',
    userId: 'u1',
    code: 'CPN-DBL222',
    status: 'USED', // Atingiu limite de 2 do sundae
    redeemedAt: '2023-10-12T13:00:00Z',
    validatedBy: 'Carlos BK',
    validatedAt: '2023-10-12T13:10:00Z'
  },

  // Other Users Redemptions (For Admin/Manager Stats)
  {
    id: 'r6',
    couponId: 'c1',
    userId: 'u2',
    code: 'CPN-RND001',
    status: 'USED',
    redeemedAt: '2023-10-02T10:00:00Z',
    validatedBy: 'Carlos BK',
    validatedAt: '2023-10-02T10:05:00Z'
  },
  {
    id: 'r7',
    couponId: 'c1',
    userId: 'u3',
    code: 'CPN-RND002',
    status: 'PENDING',
    redeemedAt: '2023-10-03T11:00:00Z'
  },
  {
    id: 'r8',
    couponId: 'c2',
    userId: 'u2',
    code: 'CPN-RUN888',
    status: 'USED',
    redeemedAt: '2023-10-05T19:00:00Z',
    validatedBy: 'Gerente Centauro',
    validatedAt: '2023-10-05T19:15:00Z'
  }
];

export const CATEGORIES = ['Todos', 'Alimentação', 'Moda', 'Esportes', 'Serviços'];