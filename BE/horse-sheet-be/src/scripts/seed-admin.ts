import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import dataSource from '../config/data-source';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { UserRole } from '../auth/entities/user-role.entity';

// Load environment variables
config({ path: ['.env.local', '.env'] });

async function seedAdmin() {

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    console.log('Database connected');

    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const userRoleRepository = dataSource.getRepository(UserRole);

    // Get admin role
    const adminRole = await roleRepository.findOne({
      where: { code: 'admin' },
    });

    if (!adminRole) {
      throw new Error('Admin role not found. Please run migrations first.');
    }

    // Check if admin user already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@horsesheet.com';
    const existingUser = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      // Check if user has admin role
      const hasAdminRole = await userRoleRepository.findOne({
        where: {
          userId: existingUser.id,
          roleId: adminRole.id,
        },
      });

      if (!hasAdminRole) {
        // Assign admin role
        const userRole = userRoleRepository.create({
          userId: existingUser.id,
          roleId: adminRole.id,
        });
        await userRoleRepository.save(userRole);
        console.log('Admin role assigned to existing user.');
      } else {
        console.log('User already has admin role.');
      }
      return;
    }

    // Create admin user
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    const adminUser = userRepository.create({
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    });

    const savedUser = await userRepository.save(adminUser);
    console.log(`Admin user created with email: ${adminEmail}`);

    // Assign admin role
    const userRole = userRoleRepository.create({
      userId: savedUser.id,
      roleId: adminRole.id,
    });
    await userRoleRepository.save(userRole);
    console.log('Admin role assigned.');

    console.log('\n✅ Admin user seeded successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${defaultPassword}`);
    console.log('\n⚠️  Please change the default password after first login!');
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

seedAdmin();

