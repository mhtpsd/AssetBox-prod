import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@assetbox.com' },
    update: {},
    create: {
      email: 'admin@assetbox.com',
      name: 'Admin User',
      username: 'admin',
      isAdmin: true,
      emailVerified: new Date(),
      acceptedTermsAt: new Date(),
      paymentVerified: true,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'creator@example.com' },
      update: {},
      create: {
        email: 'creator@example.com',
        name: 'Demo Creator',
        username: 'democreator',
        bio: 'Professional 3D artist and asset creator',
        emailVerified: new Date(),
        acceptedTermsAt: new Date(),
        paymentVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'buyer@example.com' },
      update: {},
      create: {
        email: 'buyer@example.com',
        name: 'Demo Buyer',
        username: 'demobuyer',
        emailVerified: new Date(),
        acceptedTermsAt: new Date(),
      },
    }),
  ]);

  console.log('✅ Created demo users');

  // Create sample assets
  const sampleAssets = await Promise.all([
    prisma.asset.create({
      data: {
        ownerId: users[0].id,
        title: 'Modern Office Chair 3D Model',
        description:
          'High-quality 3D model of a modern office chair with PBR textures. Perfect for architectural visualization and interior design projects.',
        assetType: 'THREE_D',
        category: '3d',
        subcategory: 'Models',
        tags: ['3d', 'furniture', 'office', 'chair', 'modern'],
        price: 29.99,
        status: 'APPROVED',
        licenseType: 'STANDARD',
        viewCount: 150,
        files: {
          create: [
            {
              fileType: 'THUMBNAIL',
              fileUrl: '/placeholder-thumbnail.jpg',
              fileSize: 102400,
              fileFormat: 'jpg',
              mimeType: 'image/jpeg',
            },
            {
              fileType: 'PREVIEW',
              fileUrl: '/placeholder-preview.jpg',
              fileSize: 512000,
              fileFormat: 'jpg',
              mimeType: 'image/jpeg',
            },
            {
              fileType: 'ORIGINAL',
              fileUrl: '/placeholder-model.zip',
              fileSize: 5242880,
              fileFormat: 'zip',
              mimeType: 'application/zip',
            },
          ],
        },
      },
    }),
    prisma.asset.create({
      data: {
        ownerId: users[0].id,
        title: 'Ambient Forest Sounds',
        description:
          'Peaceful forest ambience with birds chirping and gentle wind. 30 minutes of high-quality audio recording.',
        assetType: 'AUDIO',
        category: 'audio',
        subcategory: 'Sound Effects',
        tags: ['audio', 'forest', 'nature', 'ambient', 'relaxing'],
        price: 9.99,
        status: 'APPROVED',
        licenseType: 'COMMERCIAL',
        viewCount: 89,
        files: {
          create: [
            {
              fileType: 'THUMBNAIL',
              fileUrl: '/placeholder-audio-thumb.jpg',
              fileSize: 51200,
              fileFormat: 'jpg',
              mimeType: 'image/jpeg',
            },
            {
              fileType: 'PREVIEW',
              fileUrl: '/placeholder-audio-preview.mp3',
              fileSize: 1048576,
              fileFormat: 'mp3',
              mimeType: 'audio/mpeg',
            },
            {
              fileType: 'ORIGINAL',
              fileUrl: '/placeholder-audio-full.wav',
              fileSize: 52428800,
              fileFormat: 'wav',
              mimeType: 'audio/wav',
            },
          ],
        },
      },
    }),
    prisma.asset.create({
      data: {
        ownerId: users[0].id,
        title: 'Sci-Fi UI Icons Pack',
        description:
          '200+ vector icons perfect for sci-fi themed games and applications. Includes AI and SVG formats.',
        assetType: 'TWO_D',
        category: 'illustrations',
        subcategory: 'Icons',
        tags: ['2d', 'icons', 'ui', 'sci-fi', 'vector'],
        price: 19.99,
        status: 'APPROVED',
        licenseType: 'EXTENDED',
        viewCount: 234,
        files: {
          create: [
            {
              fileType: 'THUMBNAIL',
              fileUrl: '/placeholder-icons-thumb.jpg',
              fileSize: 81920,
              fileFormat: 'jpg',
              mimeType: 'image/jpeg',
            },
            {
              fileType: 'PREVIEW',
              fileUrl: '/placeholder-icons-preview.jpg',
              fileSize: 409600,
              fileFormat: 'jpg',
              mimeType: 'image/jpeg',
            },
            {
              fileType: 'ORIGINAL',
              fileUrl: '/placeholder-icons.zip',
              fileSize: 10485760,
              fileFormat: 'zip',
              mimeType: 'application/zip',
            },
          ],
        },
      },
    }),
    prisma.asset.create({
      data: {
        ownerId: users[0].id,
        title: 'Product Photography Template',
        description:
          'Professional product photography Photoshop template with smart objects and lighting layers.',
        assetType: 'IMAGE',
        category: 'templates',
        subcategory: 'Print',
        tags: ['image', 'template', 'photoshop', 'product', 'photography'],
        price: 14.99,
        status: 'PENDING',
        licenseType: 'STANDARD',
        viewCount: 12,
        files: {
          create: [
            {
              fileType: 'THUMBNAIL',
              fileUrl: '/placeholder-template-thumb.jpg',
              fileSize: 102400,
              fileFormat: 'jpg',
              mimeType: 'image/jpeg',
            },
            {
              fileType: 'PREVIEW',
              fileUrl: '/placeholder-template-preview.jpg',
              fileSize: 819200,
              fileFormat: 'jpg',
              mimeType: 'image/jpeg',
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${sampleAssets.length} sample assets`);

  // Create a sample order
  const order = await prisma.order.create({
    data: {
      userId: users[1].id,
      totalAmount: 29.99,
      paymentStatus: 'PAID',
      stripePaymentId: 'pi_demo_12345',
      items: {
        create: {
          assetId: sampleAssets[0].id,
          price: 29.99,
        },
      },
    },
  });

  console.log('✅ Created sample order');

  // Grant ownership to buyer
  await prisma.userAsset.create({
    data: {
      userId: users[1].id,
      assetId: sampleAssets[0].id,
      orderId: order.id,
    },
  });

  console.log('✅ Granted asset ownership');

  // Create earning record
  await prisma.earning.create({
    data: {
      userId: users[0].id,
      assetId: sampleAssets[0].id,
      orderId: order.id,
      amount: 25.49, // 85% of 29.99
      platformFee: 4.50, // 15% platform fee
    },
  });

  console.log('✅ Created earning record');

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'NEW_SALE',
        title: 'New Sale!',
        message: 'Your asset "Modern Office Chair 3D Model" was purchased.',
        data: { assetId: sampleAssets[0].id, amount: 29.99 },
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'ASSET_APPROVED',
        title: 'Asset Approved',
        message: 'Your asset "Modern Office Chair 3D Model" has been approved.',
        data: { assetId: sampleAssets[0].id },
        isRead: true,
      },
    }),
  ]);

  console.log('✅ Created notifications');

  // Create a support ticket
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: users[1].id,
      subject: 'Question about licensing',
      status: 'OPEN',
      priority: 'NORMAL',
      messages: {
        create: {
          senderId: users[1].id,
          isAdmin: false,
          message:
            'Hi, I have a question about the commercial license. Can I use the assets in client projects?',
        },
      },
    },
  });

  console.log('✅ Created support ticket');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\nDemo accounts created:');
  console.log('👤 Admin: admin@assetbox.com');
  console.log('👤 Creator: creator@example.com');
  console.log('👤 Buyer: buyer@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });