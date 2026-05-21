import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding started...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  /* ============================================================
     USERS
  ============================================================ */
  await prisma.user.createMany({
    data: [
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: Role.ADMIN,
      },
      {
        name: 'Toko Sasirangan',
        email: 'sasirangan@example.com',
        password: hashedPassword,
        role: Role.SELLER,
      },
      {
        name: 'Toko Wadai',
        email: 'wadai@example.com',
        password: hashedPassword,
        role: Role.SELLER,
      },
      {
        name: 'Pembeli A',
        email: 'buyer1@example.com',
        password: hashedPassword,
        role: Role.BUYER,
      },
      {
        name: 'Pembeli B',
        email: 'buyer2@example.com',
        password: hashedPassword,
        role: Role.BUYER,
      },
    ],
    skipDuplicates: true,
  });

  const allUsers = await prisma.user.findMany();
  const seller1 = allUsers.find((u) => u.email === 'sasirangan@example.com')!;
  const seller2 = allUsers.find((u) => u.email === 'wadai@example.com')!;
  const buyer1 = allUsers.find((u) => u.email === 'buyer1@example.com')!;

  /* ============================================================
     CATEGORIES
  ============================================================ */

  await prisma.category.createMany({
    data: [
      { name: 'Makanan', description: 'Produk makanan khas Banjar' },
      { name: 'Minuman', description: 'Minuman khas Banjarmasin' },
      { name: 'Fashion', description: 'Pakaian UMKM Banjarmasin' },
      { name: 'Kerajinan', description: 'Kerajinan tangan lokal' },
    ],
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany();
  const cat = {
    makanan: categories.find((c) => c.name === 'Makanan')!.id,
    minuman: categories.find((c) => c.name === 'Minuman')!.id,
    fashion: categories.find((c) => c.name === 'Fashion')!.id,
    kerajinan: categories.find((c) => c.name === 'Kerajinan')!.id,
  };

  /* ============================================================
     ITEMS — 20 ITEMS (10 per seller)
  ============================================================ */

  const itemsData = [
    // --- SELLER 1 ---
    {
      name: 'Kain Sasirangan Premium',
      desc: 'Motif modern Banjar',
      price: 250000,
      stock: 20,
      img: '/items/1765085042653-IMG-20120918-00103.jpg',
      cat: cat.fashion,
      seller: seller1.id,
    },
    {
      name: 'Tas Rotan Anyaman',
      desc: 'Kerajinan rotan handmade',
      price: 150000,
      stock: 30,
      img: '/items/1765085658419-rotan.jpg',
      cat: cat.kerajinan,
      seller: seller1.id,
    },
    {
      name: 'Dompet Sasirangan',
      desc: 'Dompet elegan motif sasirangan',
      price: 45000,
      stock: 40,
      img: '/items/1765085114524-dompet_sasirangan.jpg',
      cat: cat.fashion,
      seller: seller1.id,
    },
    {
      name: 'Miniatur Jukung',
      desc: 'Miniatur kapal tradisional Banjar',
      price: 70000,
      stock: 15,
      img: '/items/1765085665394-miniatur-jukung.png',
      cat: cat.kerajinan,
      seller: seller1.id,
    },
    {
      name: 'Anyaman Purun',
      desc: 'Kerajinan purun khas Kalimantan',
      price: 35000,
      stock: 50,
      img: '/items/1765085195589-anyaman_purun.webp',
      cat: cat.kerajinan,
      seller: seller1.id,
    },
    {
      name: 'Sisir Kayu Ulin',
      desc: 'Sisir kayu ulin tahan lama',
      price: 20000,
      stock: 80,
      img: '/items/1765085670586-sisir_ulin.webp',
      cat: cat.kerajinan,
      seller: seller1.id,
    },
    {
      name: 'Gelang Manik Dayak',
      desc: 'Gelang etnik khas Kalimantan',
      price: 30000,
      stock: 70,
      img: '/items/1765085680482-gelak-manik-dayak.jpg',
      cat: cat.fashion,
      seller: seller1.id,
    },
    {
      name: 'Syal Sasirangan',
      desc: 'Syal dari kain sasirangan asli',
      price: 65000,
      stock: 25,
      img: '/items/1765085686808-syal-sasirangan.jpg',
      cat: cat.fashion,
      seller: seller1.id,
    },
    {
      name: 'Topi Rotan Baimbai',
      desc: 'Topi rotan handmade',
      price: 55000,
      stock: 33,
      img: '/items/1765085700058-topi-rotan.jpeg',
      cat: cat.kerajinan,
      seller: seller1.id,
    },
    {
      name: 'Gantungan Kunci Sasirangan',
      desc: 'Aksesoris motif sasirangan',
      price: 15000,
      stock: 200,
      img: '/items/1765084242721-Screenshot_2025-11-14_125547.png',
      cat: cat.fashion,
      seller: seller1.id,
    },

    // ----- SELLER 2 -----

    {
      name: 'Wadai Bingka',
      desc: 'Kue khas Banjar',
      price: 20000,
      stock: 50,
      img: '/items/1765085711279-bingka.jpeg',
      cat: cat.makanan,
      seller: seller2.id,
    },
    {
      name: 'Es Saraba Banjar',
      desc: 'Minuman rempah khas Banjar',
      price: 10000,
      stock: 100,
      img: '/items/1765085718319-es-saraba.jpg',
      cat: cat.minuman,
      seller: seller2.id,
    },
    {
      name: 'Amplang Ikan Pipih',
      desc: 'Camilan renyah khas Kalimantan',
      price: 25000,
      stock: 120,
      img: '/items/1765085727448-amplang.jpg',
      cat: cat.makanan,
      seller: seller2.id,
    },
    {
      name: 'Sambal Acan Banjar',
      desc: 'Sambal pedas khas Banjar',
      price: 18000,
      stock: 70,
      img: '/items/1765085746093-sambal-acan.jpg',
      cat: cat.makanan,
      seller: seller2.id,
    },
    {
      name: 'Kopi Banua',
      desc: 'Kopi robusta khas Kalsel',
      price: 35000,
      stock: 45,
      img: '/items/1765085775971-kopi-banua.jpg',
      cat: cat.minuman,
      seller: seller2.id,
    },
    {
      name: 'Teh Gambut',
      desc: 'Teh herbal lokal',
      price: 30000,
      stock: 60,
      img: '/items/1765085941561-teh-gambut.jpeg',
      cat: cat.minuman,
      seller: seller2.id,
    },
    {
      name: 'Kerupuk Ikan Haruan',
      desc: 'Kerupuk ikan gabus',
      price: 22000,
      stock: 90,
      img: '/items/1765086023286-kerupuk_haruan.jpg',
      cat: cat.makanan,
      seller: seller2.id,
    },
    {
      name: 'Sari Jahe Merah Banjar',
      desc: 'Jahe merah tradisional',
      price: 15000,
      stock: 110,
      img: '/items/1765086034099-sari-jeha-merah.webp',
      cat: cat.minuman,
      seller: seller2.id,
    },
    {
      name: 'Dodol Kandangan',
      desc: 'Dodol khas Kandangan',
      price: 25000,
      stock: 75,
      img: '/items/1765086043799-dodol-kandangan.jpg',
      cat: cat.makanan,
      seller: seller2.id,
    },
    {
      name: 'Roti Mantau Banjar',
      desc: 'Roti tradisional gurih',
      price: 12000,
      stock: 65,
      img: '/items/1765086174006-roti_mantau.jpeg',
      cat: cat.makanan,
      seller: seller2.id,
    },
  ];

  await prisma.item.createMany({
    data: itemsData.map((i) => ({
      userId: i.seller,
      name: i.name,
      description: i.desc,
      price: i.price,
      stock: i.stock,
      imageUrl: i.img,
      categoryId: i.cat,
    })),
    skipDuplicates: true,
  });

  /* ============================================================
     SAMPLE ORDER — sesuai schema baru
  ============================================================ */

  const firstItem = await prisma.item.findFirst({
    where: { userId: seller1.id },
  });

  if (firstItem) {
    await prisma.order.create({
      data: {
        userId: buyer1.id,
        totalPrice: firstItem.price * 2,
        status: 'PAID',

        // NEW REQUIRED FIELDS
        fullName: 'Pembeli A',
        phone: '08123456789',
        address: 'Jl. Mawar No. 10',
        city: 'Banjarmasin',
        postalCode: '70122',
        notes: 'Pesanan contoh',

        items: {
          create: [
            {
              itemId: firstItem.id,
              quantity: 2,
              subtotal: firstItem.price * 2,
            },
          ],
        },
      },
    });
  }

  console.log('🌱 Seeding completed successfully!');
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
