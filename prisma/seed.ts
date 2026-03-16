import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";
import { staticServiceData, type ServiceRoute } from "../lib/service-data";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function upsertSiteContent(data: {
  type: "BANNER" | "PARTNER" | "SOCIAL_LINK";
  sortOrder: number;
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  link?: string | null;
  icon?: string | null;
  isActive?: boolean;
}) {
  const existing = await prisma.siteContent.findFirst({
    where: { type: data.type, sortOrder: data.sortOrder },
  });

  if (existing) {
    return prisma.siteContent.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.siteContent.create({ data });
}

async function upsertMenu(data: {
  name: string;
  description?: string | null;
  serviceTierId?: string | null;
  downloadUrl?: string | null;
  isActive?: boolean;
  items: Array<{
    name: string;
    description?: string | null;
    price: number;
    ingredients: string[];
    allergens: string[];
    imageUrl?: string | null;
    sortOrder: number;
  }>;
}) {
  const existing = await prisma.menu.findFirst({
    where: { name: data.name },
  });

  const menu = existing
    ? await prisma.menu.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          description: data.description,
          serviceTierId: data.serviceTierId,
          downloadUrl: data.downloadUrl,
          isActive: data.isActive ?? true,
        },
      })
    : await prisma.menu.create({
        data: {
          name: data.name,
          description: data.description,
          serviceTierId: data.serviceTierId,
          downloadUrl: data.downloadUrl,
          isActive: data.isActive ?? true,
        },
      });

  // Delete existing items linked to this menu to avoid duplicates
  const existingLinks = await prisma.menuMenuItem.findMany({
    where: { menuId: menu.id },
    select: { menuItemId: true }
  });

  if (existingLinks.length > 0) {
    await prisma.menuItem.deleteMany({
      where: { id: { in: existingLinks.map((l) => l.menuItemId) } }
    });
  }

  // Create new items and link them
  for (const item of data.items) {
    const { sortOrder, ...itemData } = item;
    const menuItem = await prisma.menuItem.create({
      data: itemData
    });

    await prisma.menuMenuItem.create({
      data: {
        menuId: menu.id,
        menuItemId: menuItem.id,
        sortOrder: sortOrder
      }
    });
  }

  return menu;
}

async function upsertEvent(data: {
  title: string;
  description?: string | null;
  eventType: "WEDDING" | "CORPORATE" | "PRIVATE" | "SOCIAL";
  guestCount: number;
  coverImageUrl?: string | null;
  imageUrls: string[];
  eventDate?: Date | null;
  chefProfileId?: string | null;
  companyProfileId?: string | null;
  isFeatured?: boolean;
}) {
  const existing = await prisma.event.findFirst({
    where: { title: data.title },
  });

  if (existing) {
    return prisma.event.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.event.create({ data });
}

async function main() {
  console.log("Seeding database...");

  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(now.getDate() + 30);
  const in365Days = new Date(now);
  in365Days.setDate(now.getDate() + 365);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@mncaterer.mn";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const adminName = process.env.ADMIN_NAME || "System Admin";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.dashboardUser.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: adminPasswordHash,
      role: "ADMIN",
      isVerified: true,
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: adminPasswordHash,
      name: adminName,
      role: "ADMIN",
      isVerified: true,
      isActive: true,
    },
  });

  const chefPasswordHash = await bcrypt.hash("Chef123!", 10);
  const chefUser = await prisma.dashboardUser.upsert({
    where: { email: "chef@mncaterer.mn" },
    update: {
      name: "Chef Altan",
      password: chefPasswordHash,
      role: "CHEF",
      isVerified: true,
      isActive: true,
    },
    create: {
      email: "chef@mncaterer.mn",
      password: chefPasswordHash,
      name: "Chef Altan",
      role: "CHEF",
      isVerified: true,
      isActive: true,
    },
  });

  const companyPasswordHash = await bcrypt.hash("Company123!", 10);
  const companyUser = await prisma.dashboardUser.upsert({
    where: { email: "company@mncaterer.mn" },
    update: {
      name: "Nomad Events LLC",
      password: companyPasswordHash,
      role: "COMPANY",
      isVerified: true,
      isActive: true,
    },
    create: {
      email: "company@mncaterer.mn",
      password: companyPasswordHash,
      name: "Nomad Events LLC",
      role: "COMPANY",
      isVerified: true,
      isActive: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@mncaterer.mn" },
    update: {
      name: "Bat Erdene",
      phone: "+976-99119911",
      userType: "INDIVIDUAL",
    },
    create: {
      email: "customer@mncaterer.mn",
      name: "Bat Erdene",
      firstName: "Bat",
      lastName: "Erdene",
      phone: "+976-99119911",
      address: "Sukhbaatar District, Ulaanbaatar",
      userType: "INDIVIDUAL",
    },
  });

  const chefProfile = await prisma.chefProfile.upsert({
    where: { dashboardUserId: chefUser.id },
    update: {
      specialty: "Modern Mongolian Fine Dining",
      bio: "Executive chef focused on premium private and corporate events.",
      yearsExperience: 12,
      certifications: ["HACCP", "Food Safety Level 3"],
      rating: 4.9,
      reviewCount: 34,
      coverImage:
        "https://images.unsplash.com/photo-1607631568010-a87245c0daf8",
    },
    create: {
      dashboardUserId: chefUser.id,
      specialty: "Modern Mongolian Fine Dining",
      bio: "Executive chef focused on premium private and corporate events.",
      yearsExperience: 12,
      certifications: ["HACCP", "Food Safety Level 3"],
      rating: 4.9,
      reviewCount: 34,
      coverImage:
        "https://images.unsplash.com/photo-1607631568010-a87245c0daf8",
    },
  });

  const companyProfile = await prisma.companyProfile.upsert({
    where: { dashboardUserId: companyUser.id },
    update: {
      companyName: "Nomad Events LLC",
      description: "Full-service event production and catering management.",
      services: ["Catering", "Venue Setup", "Staffing"],
      portfolioImages: [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
      ],
      approvalStatus: "APPROVED",
      approvedAt: now,
    },
    create: {
      dashboardUserId: companyUser.id,
      companyName: "Nomad Events LLC",
      description: "Full-service event production and catering management.",
      services: ["Catering", "Venue Setup", "Staffing"],
      portfolioImages: [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
      ],
      approvalStatus: "APPROVED",
      approvedAt: now,
    },
  });

  const serviceTierPairs = await Promise.all(
    staticServiceData.map(async (service) => {
      const tier = await prisma.serviceTier.upsert({
        where: { name: service.route },
        update: {
          description: service.seedTier.description,
          pricePerGuest: service.seedTier.pricePerGuest,
          features: service.seedTier.features,
          isVIP: service.seedTier.isVIP,
          sortOrder: service.seedTier.sortOrder,
        },
        create: {
          name: service.route,
          description: service.seedTier.description,
          pricePerGuest: service.seedTier.pricePerGuest,
          features: service.seedTier.features,
          isVIP: service.seedTier.isVIP,
          sortOrder: service.seedTier.sortOrder,
        },
      });

      return [service.route, tier] as const;
    }),
  );

  const serviceTiersByRoute = Object.fromEntries(serviceTierPairs) as Record<
    ServiceRoute,
    (typeof serviceTierPairs)[number][1]
  >;

  await upsertSiteContent({
    type: "BANNER",
    sortOrder: 1,
    title: "Crafted Catering Experiences",
    subtitle: "Private, corporate, and wedding events across Mongolia.",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033",
    isActive: true,
  });

  await upsertSiteContent({
    type: "BANNER",
    sortOrder: 2,
    title: "Chef-Driven Menus",
    subtitle: "From corporate to VIP service tiers.",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    isActive: true,
  });

  await upsertSiteContent({
    type: "PARTNER",
    sortOrder: 1,
    title: "Blue Sky Hotel",
    isActive: true,
  });

  await upsertSiteContent({
    type: "PARTNER",
    sortOrder: 2,
    title: "Steppe Convention Hall",
    isActive: true,
  });

  await upsertSiteContent({
    type: "SOCIAL_LINK",
    sortOrder: 1,
    title: "Facebook",
    link: "https://facebook.com/MNCaterer",
    icon: "facebook",
    isActive: true,
  });

  await upsertSiteContent({
    type: "SOCIAL_LINK",
    sortOrder: 2,
    title: "Instagram",
    link: "https://instagram.com/MNCaterer",
    icon: "instagram",
    isActive: true,
  });

  const standardMenu = await upsertMenu({
    name: "Standard Celebration Menu",
    description: "Balanced dishes for family and small corporate events.",
    serviceTierId: serviceTiersByRoute.corporate.id,
    downloadUrl: "https://example.com/menus/standard.pdf",
    isActive: true,
    items: [
      {
        name: "Seasonal Salad",
        description: "Fresh mixed greens with vinaigrette.",
        price: 18000,
        ingredients: ["Lettuce", "Tomato", "Cucumber"],
        allergens: [],
        sortOrder: 1,
      },
      {
        name: "Beef Khuushuur Platter",
        description: "Classic Mongolian savory pastries.",
        price: 28000,
        ingredients: ["Beef", "Flour", "Onion"],
        allergens: ["Gluten"],
        sortOrder: 2,
      },
      {
        name: "Milk Tea Panna Cotta",
        description: "Creamy dessert with Mongolian milk tea notes.",
        price: 14000,
        ingredients: ["Milk", "Cream", "Tea"],
        allergens: ["Dairy"],
        sortOrder: 3,
      },
    ],
  });

  const premiumMenu = await upsertMenu({
    name: "Premium Signature Menu",
    description: "Elevated multi-course menu for larger occasions.",
    serviceTierId: serviceTiersByRoute.private.id,
    downloadUrl: "https://example.com/menus/premium.pdf",
    isActive: true,
    items: [
      {
        name: "Smoked Trout Canape",
        description: "Light canape with herb cream.",
        price: 24000,
        ingredients: ["Trout", "Cream Cheese", "Dill"],
        allergens: ["Fish", "Dairy", "Gluten"],
        sortOrder: 1,
      },
      {
        name: "Lamb Shoulder Roast",
        description: "Slow-roasted lamb with seasonal vegetables.",
        price: 46000,
        ingredients: ["Lamb", "Carrot", "Potato"],
        allergens: [],
        sortOrder: 2,
      },
      {
        name: "Sea Buckthorn Mousse",
        description: "Tangy mousse with berry glaze.",
        price: 18000,
        ingredients: ["Sea Buckthorn", "Cream", "Sugar"],
        allergens: ["Dairy"],
        sortOrder: 3,
      },
    ],
  });

  const luxuryMenu = await upsertMenu({
    name: "Luxury Chef's Table",
    description: "Curated VIP tasting menu with premium ingredients.",
    serviceTierId: serviceTiersByRoute.vip.id,
    downloadUrl: "https://example.com/menus/luxury.pdf",
    isActive: true,
    items: [
      {
        name: "Caviar Blini",
        description: "House blini with caviar and creme fraiche.",
        price: 55000,
        ingredients: ["Caviar", "Buckwheat", "Creme Fraiche"],
        allergens: ["Fish", "Dairy", "Gluten"],
        sortOrder: 1,
      },
      {
        name: "Wagyu Tenderloin",
        description: "Charcoal-seared wagyu with truffle jus.",
        price: 89000,
        ingredients: ["Wagyu Beef", "Truffle", "Shallot"],
        allergens: [],
        sortOrder: 2,
      },
      {
        name: "Golden Honey Cake",
        description: "Layered honey cake with saffron cream.",
        price: 26000,
        ingredients: ["Honey", "Flour", "Cream"],
        allergens: ["Dairy", "Gluten"],
        sortOrder: 3,
      },
    ],
  });

  await upsertMenu({
    name: "Kids Friendly Menu",
    description: "Optional menu available across all tiers.",
    serviceTierId: null,
    downloadUrl: "https://example.com/menus/kids.pdf",
    isActive: true,
    items: [
      {
        name: "Mini Chicken Skewers",
        description: "Tender grilled chicken with mild seasoning.",
        price: 16000,
        ingredients: ["Chicken", "Yogurt", "Spices"],
        allergens: ["Dairy"],
        sortOrder: 1,
      },
      {
        name: "Fruit Cups",
        description: "Seasonal mixed fruit selection.",
        price: 9000,
        ingredients: ["Apple", "Orange", "Grape"],
        allergens: [],
        sortOrder: 2,
      },
    ],
  });

  const booking = await prisma.booking.upsert({
    where: { bookingNumber: "SEED-BOOKING-001" },
    update: {
      customerId: customer.id,
      chefProfileId: chefProfile.id,
      serviceTierId: serviceTiersByRoute.private.id,
      menuId: premiumMenu.id,
      serviceType: "CORPORATE",
      eventDate: in30Days,
      eventTime: "18:00",
      guestCount: 120,
      venue: "Steppe Convention Hall",
      venueAddress: "Bayanzurkh District, Ulaanbaatar",
      specialRequests: "Include vegetarian table options.",
      status: "CONFIRMED",
      totalPrice: 17400000,
      depositAmount: 5220000,
    },
    create: {
      bookingNumber: "SEED-BOOKING-001",
      customerId: customer.id,
      chefProfileId: chefProfile.id,
      serviceTierId: serviceTiersByRoute.private.id,
      menuId: premiumMenu.id,
      serviceType: "CORPORATE",
      eventDate: in30Days,
      eventTime: "18:00",
      guestCount: 120,
      venue: "Steppe Convention Hall",
      venueAddress: "Bayanzurkh District, Ulaanbaatar",
      specialRequests: "Include vegetarian table options.",
      status: "CONFIRMED",
      totalPrice: 17400000,
      depositAmount: 5220000,
    },
  });

  await prisma.contract.upsert({
    where: { bookingId: booking.id },
    update: {
      status: "SENT",
      termsContent: "Standard catering contract terms and payment schedule.",
    },
    create: {
      bookingId: booking.id,
      status: "SENT",
      termsContent: "Standard catering contract terms and payment schedule.",
    },
  });

  const existingPayment = await prisma.payment.findFirst({
    where: { bookingId: booking.id, method: "BANK_TRANSFER" },
  });

  const payment = existingPayment
    ? await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount: 5220000,
          status: "PROCESSING",
          bankName: "Khan Bank",
          accountNumber: "5000123456",
          transferRef: "SEED-DEP-001",
        },
      })
    : await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: 5220000,
          method: "BANK_TRANSFER",
          status: "PROCESSING",
          bankName: "Khan Bank",
          accountNumber: "5000123456",
          transferRef: "SEED-DEP-001",
        },
      });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-SEED-001" },
    update: {
      paymentId: payment.id,
      items: [
        { name: "Premium catering package", quantity: 120, unitPrice: 145000 },
      ],
      subtotal: 17400000,
      tax: 1740000,
      total: 19140000,
      dueDate: in30Days,
    },
    create: {
      paymentId: payment.id,
      invoiceNumber: "INV-SEED-001",
      items: [
        { name: "Premium catering package", quantity: 120, unitPrice: 145000 },
      ],
      subtotal: 17400000,
      tax: 1740000,
      total: 19140000,
      dueDate: in30Days,
    },
  });

  await prisma.review.upsert({
    where: {
      bookingId_customerId: {
        bookingId: booking.id,
        customerId: customer.id,
      },
    },
    update: {
      chefProfileId: chefProfile.id,
      rating: 5,
      title: "Exceptional execution",
      comment:
        "Great food quality and professional team from planning to service.",
    },
    create: {
      bookingId: booking.id,
      customerId: customer.id,
      chefProfileId: chefProfile.id,
      rating: 5,
      title: "Exceptional execution",
      comment:
        "Great food quality and professional team from planning to service.",
    },
  });

  await prisma.membership.upsert({
    where: { chefProfileId: chefProfile.id },
    update: {
      type: "ANNUAL",
      price: 1200000,
      startDate: now,
      expiryDate: in365Days,
      status: "ACTIVE",
    },
    create: {
      chefProfileId: chefProfile.id,
      type: "ANNUAL",
      price: 1200000,
      startDate: now,
      expiryDate: in365Days,
      status: "ACTIVE",
    },
  });

  const earningTx = await prisma.transactionHistory.findFirst({
    where: {
      chefProfileId: chefProfile.id,
      type: "EARNING",
      description: "Seed booking earning",
      relatedBookingId: booking.id,
    },
  });

  if (!earningTx) {
    await prisma.transactionHistory.create({
      data: {
        chefProfileId: chefProfile.id,
        type: "EARNING",
        amount: 5220000,
        description: "Seed booking earning",
        relatedBookingId: booking.id,
      },
    });
  }

  await upsertEvent({
    title: "Luxury Wedding at Zaisan",
    description: "150-guest outdoor wedding service with full premium setup.",
    eventType: "WEDDING",
    guestCount: 150,
    coverImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552",
    imageUrls: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
      "https://images.unsplash.com/photo-1478144592103-25e218a04891",
    ],
    eventDate: in30Days,
    chefProfileId: chefProfile.id,
    companyProfileId: companyProfile.id,
    isFeatured: true,
  });

  await upsertEvent({
    title: "Corporate Annual Gala",
    description: "Executive-level corporate banquet for enterprise clients.",
    eventType: "CORPORATE",
    guestCount: 220,
    coverImageUrl:
      "https://images.unsplash.com/photo-1503428593586-e225b39bddfe",
    imageUrls: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    ],
    eventDate: in30Days,
    chefProfileId: chefProfile.id,
    companyProfileId: companyProfile.id,
    isFeatured: true,
  });

  const existingJobPosting = await prisma.jobPosting.findFirst({
    where: { title: "VIP Private Dinner - 40 Guests" },
  });

  const jobPosting = existingJobPosting
    ? await prisma.jobPosting.update({
        where: { id: existingJobPosting.id },
        data: {
          createdById: admin.id,
          description:
            "Need an experienced chef for a private residence event.",
          eventDate: in30Days,
          eventTime: "19:30",
          guestCount: 40,
          venue: "Zaisan Hill Residence",
          budget: 7200000,
          status: "OPEN",
        },
      })
    : await prisma.jobPosting.create({
        data: {
          createdById: admin.id,
          title: "VIP Private Dinner - 40 Guests",
          description:
            "Need an experienced chef for a private residence event.",
          eventType: "PRIVATE",
          eventDate: in30Days,
          eventTime: "19:30",
          guestCount: 40,
          venue: "Zaisan Hill Residence",
          budget: 7200000,
          status: "OPEN",
        },
      });

  await prisma.jobInvitation.upsert({
    where: {
      jobPostingId_chefId: {
        jobPostingId: jobPosting.id,
        chefId: chefUser.id,
      },
    },
    update: {
      status: "PENDING",
    },
    create: {
      jobPostingId: jobPosting.id,
      chefId: chefUser.id,
      status: "PENDING",
    },
  });

  const userNotification = await prisma.notification.findFirst({
    where: {
      userId: customer.id,
      title: "Booking confirmed",
    },
  });

  if (userNotification) {
    await prisma.notification.update({
      where: { id: userNotification.id },
      data: {
        type: "IN_APP",
        message: "Your booking SEED-BOOKING-001 has been confirmed.",
        isRead: false,
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId: customer.id,
        type: "IN_APP",
        title: "Booking confirmed",
        message: "Your booking SEED-BOOKING-001 has been confirmed.",
      },
    });
  }

  const dashboardNotification = await prisma.dashboardNotification.findFirst({
    where: {
      dashboardUserId: admin.id,
      title: "New inquiry submitted",
    },
  });

  if (dashboardNotification) {
    await prisma.dashboardNotification.update({
      where: { id: dashboardNotification.id },
      data: {
        type: "IN_APP",
        message: "A new inquiry is waiting for review in the admin dashboard.",
        isRead: false,
      },
    });
  } else {
    await prisma.dashboardNotification.create({
      data: {
        dashboardUserId: admin.id,
        type: "IN_APP",
        title: "New inquiry submitted",
        message: "A new inquiry is waiting for review in the admin dashboard.",
      },
    });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: "https://push.example.com/seed-user-endpoint" },
    update: {
      p256dh: "seed_p256dh_key",
      auth: "seed_auth_token",
      userAgent: "seed-script",
      userId: customer.id,
      dashboardUserId: null,
      lastUsedAt: now,
    },
    create: {
      endpoint: "https://push.example.com/seed-user-endpoint",
      p256dh: "seed_p256dh_key",
      auth: "seed_auth_token",
      userAgent: "seed-script",
      userId: customer.id,
      lastUsedAt: now,
    },
  });

  const inquiry = await prisma.inquiry.findFirst({
    where: {
      email: "inquiry@steppecorp.mn",
      phone: "+976-99112233",
    },
  });

  if (inquiry) {
    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: {
        userId: customer.id,
        type: "ORG",
        name: "Steppe Corp",
        serviceType: "CORPORATE",
        message: "We need recurring monthly catering service for 80 guests.",
        status: "NEW",
      },
    });
  } else {
    await prisma.inquiry.create({
      data: {
        userId: customer.id,
        type: "ORG",
        name: "Steppe Corp",
        phone: "+976-99112233",
        email: "inquiry@steppecorp.mn",
        serviceType: "CORPORATE",
        message: "We need recurring monthly catering service for 80 guests.",
        status: "NEW",
      },
    });
  }

  void standardMenu;
  void luxuryMenu;

  console.log("Database seeded successfully.");
  console.log(`Admin: ${admin.email}`);
  console.log(
    `Service tiers seeded: ${staticServiceData.map((service) => service.route).join(", ")}`,
  );
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
