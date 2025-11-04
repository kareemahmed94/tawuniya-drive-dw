import { PrismaClient, ServiceCategory, RuleType, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ========================================
  // Upsert Global Configurations
  // ========================================
  console.log('⚙️  Upserting global configurations...');

  await prisma.globalConfig.upsert({
    where: { key: 'POINT_TO_SAR_RATE' },
    update: {
      value: '1',
      type: 'BUSINESS',
      description: 'Conversion rate: 1 point = 1 SAR',
    },
    create: {
      key: 'POINT_TO_SAR_RATE',
      value: '1',
      type: 'BUSINESS',
      description: 'Conversion rate: 1 point = 1 SAR',
    },
  });

  await prisma.globalConfig.upsert({
    where: { key: 'DEFAULT_EXPIRY_DAYS' },
    update: {
      value: '180',
      type: 'BUSINESS',
      description: 'Default point expiry period in days (6 months)',
    },
    create: {
      key: 'DEFAULT_EXPIRY_DAYS',
      value: '180',
      type: 'BUSINESS',
      description: 'Default point expiry period in days (6 months)',
    },
  });

  await prisma.globalConfig.upsert({
    where: { key: 'MIN_BURN_POINTS' },
    update: {
      value: '10',
      type: 'BUSINESS',
      description: 'Minimum points required to burn',
    },
    create: {
      key: 'MIN_BURN_POINTS',
      value: '10',
      type: 'BUSINESS',
      description: 'Minimum points required to burn',
    },
  });

  await prisma.globalConfig.upsert({
    where: { key: 'MAX_DAILY_EARN_POINTS' },
    update: {
      value: '10000',
      type: 'BUSINESS',
      description: 'Maximum points a user can earn per day',
    },
    create: {
      key: 'MAX_DAILY_EARN_POINTS',
      value: '10000',
      type: 'BUSINESS',
      description: 'Maximum points a user can earn per day',
    },
  });

  // ========================================
  // Upsert Services
  // ========================================
  console.log('🚗 Upserting services...');

  const insuranceService = await prisma.service.upsert({
    where: { name: 'Car Insurance' },
    update: {
      description: 'Comprehensive car insurance coverage',
      category: ServiceCategory.INSURANCE,
      isActive: true,
    },
    create: {
      name: 'Car Insurance',
      description: 'Comprehensive car insurance coverage',
      category: ServiceCategory.INSURANCE,
      isActive: true,
    },
  });

  const carWashService = await prisma.service.upsert({
    where: { name: 'Car Wash' },
    update: {
      description: 'Professional car washing service',
      category: ServiceCategory.CAR_WASH,
      isActive: true,
    },
    create: {
      name: 'Car Wash',
      description: 'Professional car washing service',
      category: ServiceCategory.CAR_WASH,
      isActive: true,
    },
  });

  const towingService = await prisma.service.upsert({
    where: { name: 'Towing Service' },
    update: {
      description: '24/7 emergency towing assistance',
      category: ServiceCategory.TOWING,
      isActive: true,
    },
    create: {
      name: 'Towing Service',
      description: '24/7 emergency towing assistance',
      category: ServiceCategory.TOWING,
      isActive: true,
    },
  });

  const rentalService = await prisma.service.upsert({
    where: { name: 'Car Rental' },
    update: {
      description: 'Short and long-term car rental',
      category: ServiceCategory.RENTAL,
      isActive: true,
    },
    create: {
      name: 'Car Rental',
      description: 'Short and long-term car rental',
      category: ServiceCategory.RENTAL,
      isActive: true,
    },
  });

  const maintenanceService = await prisma.service.upsert({
    where: { name: 'Car Maintenance' },
    update: {
      description: 'Regular car maintenance and repairs',
      category: ServiceCategory.MAINTENANCE,
      isActive: true,
    },
    create: {
      name: 'Car Maintenance',
      description: 'Regular car maintenance and repairs',
      category: ServiceCategory.MAINTENANCE,
      isActive: true,
    },
  });

  // ========================================
  // Upsert Service Configurations (Earning Rules)
  // ========================================
  console.log('📋 Upserting service configurations...');

  // Helper function to upsert service config
  const upsertServiceConfig = async (
    serviceId: string,
    ruleType: RuleType,
    data: {
      pointsPerUnit: number;
      unitAmount: number;
      minAmount?: number;
      maxPoints?: number;
      expiryDays?: number;
      isActive?: boolean;
    }
  ) => {
    const existing = await prisma.serviceConfig.findFirst({
      where: {
        serviceId,
        ruleType,
      },
    });

    if (existing) {
      return await prisma.serviceConfig.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return await prisma.serviceConfig.create({
        data: {
          serviceId,
          ruleType,
          ...data,
        },
      });
    }
  };

  // Insurance: Earn 100 points per 1000 SAR, expires in 365 days
  await upsertServiceConfig(insuranceService.id, RuleType.EARN, {
    pointsPerUnit: 100,
    unitAmount: 1000,
    minAmount: 500,
    maxPoints: 5000,
    expiryDays: 365,
    isActive: true,
  });

  // Insurance: 1 point = 1 SAR for burning
  await upsertServiceConfig(insuranceService.id, RuleType.BURN, {
    pointsPerUnit: 1,
    unitAmount: 1,
    minAmount: 10,
    isActive: true,
  });

  // Car Wash: Earn 10 points per 100 SAR, expires in 180 days
  await upsertServiceConfig(carWashService.id, RuleType.EARN, {
    pointsPerUnit: 10,
    unitAmount: 100,
    minAmount: 50,
    maxPoints: 500,
    expiryDays: 180,
    isActive: true,
  });

  // Car Wash: 1 point = 1 SAR for burning
  await upsertServiceConfig(carWashService.id, RuleType.BURN, {
    pointsPerUnit: 1,
    unitAmount: 1,
    minAmount: 10,
    isActive: true,
  });

  // Towing: Earn 20 points per 100 SAR, expires in 180 days
  await upsertServiceConfig(towingService.id, RuleType.EARN, {
    pointsPerUnit: 20,
    unitAmount: 100,
    minAmount: 100,
    maxPoints: 1000,
    expiryDays: 180,
    isActive: true,
  });

  // Towing: 1 point = 1 SAR for burning
  await upsertServiceConfig(towingService.id, RuleType.BURN, {
    pointsPerUnit: 1,
    unitAmount: 1,
    minAmount: 10,
    isActive: true,
  });

  // Rental: Earn 50 points per 500 SAR, expires in 270 days
  await upsertServiceConfig(rentalService.id, RuleType.EARN, {
    pointsPerUnit: 50,
    unitAmount: 500,
    minAmount: 200,
    maxPoints: 2000,
    expiryDays: 270,
    isActive: true,
  });

  // Rental: 1 point = 1 SAR for burning
  await upsertServiceConfig(rentalService.id, RuleType.BURN, {
    pointsPerUnit: 1,
    unitAmount: 1,
    minAmount: 10,
    isActive: true,
  });

  // Maintenance: Earn 15 points per 100 SAR, expires in 180 days
  await upsertServiceConfig(maintenanceService.id, RuleType.EARN, {
    pointsPerUnit: 15,
    unitAmount: 100,
    minAmount: 100,
    maxPoints: 1500,
    expiryDays: 180,
    isActive: true,
  });

  // Maintenance: 1 point = 1 SAR for burning
  await upsertServiceConfig(maintenanceService.id, RuleType.BURN, {
    pointsPerUnit: 1,
    unitAmount: 1,
    minAmount: 10,
    isActive: true,
  });

  // ========================================
  // Upsert Admins
  // ========================================
  console.log('👔 Upserting admins...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Super Admin
  const superAdmin = await prisma.admin.upsert({
    where: { email: 'superadmin@tawuniya.com' },
    update: {
      name: 'Super Admin',
      password: hashedPassword,
      phone: '+966501234567',
      role: AdminRole.SUPER_ADMIN,
    },
    create: {
      name: 'Super Admin',
      email: 'superadmin@tawuniya.com',
      password: hashedPassword,
      phone: '+966501234567',
      role: AdminRole.SUPER_ADMIN,
    },
  });

  // Admin
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@tawuniya.com' },
    update: {
      name: 'Admin User',
      password: hashedPassword,
      phone: '+966501234568',
      role: AdminRole.ADMIN,
    },
    create: {
      name: 'Admin User',
      email: 'admin@tawuniya.com',
      password: hashedPassword,
      phone: '+966501234568',
      role: AdminRole.ADMIN,
    },
  });

  // Staff 1
  const staff1 = await prisma.admin.upsert({
    where: { email: 'staff@tawuniya.com' },
    update: {
      name: 'Support Staff',
      password: hashedPassword,
      phone: '+966501234569',
      role: AdminRole.STAFF,
    },
    create: {
      name: 'Support Staff',
      email: 'staff@tawuniya.com',
      password: hashedPassword,
      phone: '+966501234569',
      role: AdminRole.STAFF,
    },
  });

  // Staff 2
  const staff2 = await prisma.admin.upsert({
    where: { email: 'operations@tawuniya.com' },
    update: {
      name: 'Operations Staff',
      password: hashedPassword,
      phone: '+966501234570',
      role: AdminRole.STAFF,
    },
    create: {
      name: 'Operations Staff',
      email: 'operations@tawuniya.com',
      password: hashedPassword,
      phone: '+966501234570',
      role: AdminRole.STAFF,
    },
  });

  // ========================================
  // Upsert Test Users
  // ========================================
  console.log('👤 Upserting test users...');

  // Helper function to upsert user with wallet
  const upsertUserWithWallet = async (
    email: string,
    data: {
      first_name: string;
      last_name: string;
      username: string;
      phone?: string;
      password: string;
      isActive: boolean;
      balance: number;
    }
  ) => {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        phone: data.phone,
        password: data.password,
        isActive: data.isActive,
      },
      create: {
        email,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        phone: data.phone,
        password: data.password,
        isActive: data.isActive,
      },
    });

    // Upsert wallet for the user
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: { balance: data.balance },
      create: {
        userId: user.id,
        balance: data.balance,
      },
    });

    return user;
  };

  // Customer 1 - Active with wallet balance
  const customer1 = await upsertUserWithWallet('john.doe@example.com', {
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe',
    phone: '+966509876543',
    password: hashedPassword,
    isActive: true,
    balance: 5000.00,
  });

  // Customer 2 - Active with wallet balance
  const customer2 = await upsertUserWithWallet('jane.smith@example.com', {
    first_name: 'Jane',
    last_name: 'Smith',
    username: 'janesmith',
    phone: '+966501111111',
    password: hashedPassword,
    isActive: true,
    balance: 2500.50,
  });

  // Customer 3 - Active with zero balance
  const customer3 = await upsertUserWithWallet('ahmed.ali@example.com', {
    first_name: 'Ahmed',
    last_name: 'Ali',
    username: 'ahmedali',
    phone: '+966502222222',
    password: hashedPassword,
    isActive: true,
    balance: 0,
  });

  // Customer 4 - Active with high balance
  const customer4 = await upsertUserWithWallet('sarah.williams@example.com', {
    first_name: 'Sarah',
    last_name: 'Williams',
    username: 'sarahw',
    phone: '+966503333333',
    password: hashedPassword,
    isActive: true,
    balance: 15000.00,
  });

  // Customer 5 - Inactive user
  const customer5 = await upsertUserWithWallet('mohammed.hassan@example.com', {
    first_name: 'Mohammed',
    last_name: 'Hassan',
    username: 'mohammedh',
    phone: '+966504444444',
    password: hashedPassword,
    isActive: false,
    balance: 1000.00,
  });

  // Customer 6 - User without phone
  const customer6 = await upsertUserWithWallet('lisa.johnson@example.com', {
    first_name: 'Lisa',
    last_name: 'Johnson',
    username: 'lisaj',
    password: hashedPassword,
    isActive: true,
    balance: 750.25,
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Admins: 4 (1 Super Admin, 1 Admin, 2 Staff)`);
  console.log(`   - Services: 5`);
  console.log(`   - Service Configs: 10`);
  console.log(`   - Users: 6 (5 active, 1 inactive)`);
  console.log(`   - Wallets: 6`);
  console.log(`   - Global Configs: 4`);
  console.log('\n🔑 Admin Test Credentials:');
  console.log('   Super Admin: superadmin@tawuniya.com / password123');
  console.log('   Admin: admin@tawuniya.com / password123');
  console.log('   Staff 1: staff@tawuniya.com / password123');
  console.log('   Staff 2: operations@tawuniya.com / password123');
  console.log('\n🔑 User Test Credentials:');
  console.log('   Customer 1: john.doe@example.com / password123 (Balance: 5000.00)');
  console.log('   Customer 2: jane.smith@example.com / password123 (Balance: 2500.50)');
  console.log('   Customer 3: ahmed.ali@example.com / password123 (Balance: 0.00)');
  console.log('   Customer 4: sarah.williams@example.com / password123 (Balance: 15000.00)');
  console.log('   Customer 5: mohammed.hassan@example.com / password123 (Inactive, Balance: 1000.00)');
  console.log('   Customer 6: lisa.johnson@example.com / password123 (Balance: 750.25, No phone)');
}

main()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })

