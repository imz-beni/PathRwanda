import { PrismaClient, SectorStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sectors = [
  {
    slug: "agritech",
    name: "Agritech",
    status: SectorStatus.LIVE,
    sortOrder: 1,
    overview:
      "Technology and modern practice in farming and food systems: precision farming, post-harvest handling, agri-business and farm data.",
  },
  {
    slug: "renewable-energy",
    name: "Renewable Energy",
    status: SectorStatus.COMING_SOON,
    sortOrder: 2,
    overview: "Solar, biogas and other clean energy careers.",
  },
  {
    slug: "ict-niches",
    name: "ICT Niches",
    status: SectorStatus.COMING_SOON,
    sortOrder: 3,
    overview:
      "Specialised digital careers such as agri-drones, fintech tools and digital services.",
  },
  {
    slug: "skilled-trades",
    name: "Skilled Trades (TVET)",
    status: SectorStatus.COMING_SOON,
    sortOrder: 4,
    overview: "Technical and vocational training pathways into skilled work.",
  },
];

const agritechSkills = [
  "Crop production",
  "Irrigation management",
  "Soil health",
  "Pest and disease management",
  "Greenhouse and horticulture",
  "Post-harvest handling",
  "Food processing and safety",
  "Farm record keeping",
  "Agri-business basics",
  "Market linkage and sales",
  "Basic data and mobile tools",
  "Drone operation",
  "Training and communication",
];

// Income is left empty until a reliable source is added (the SRS asks for income only where reliable).
const agritechPathways = [
  {
    title: "Farm technician",
    description: "Supports day-to-day crop production using improved seeds, inputs and irrigation.",
    skills: [
      "Crop production",
      "Irrigation management",
      "Soil health",
      "Pest and disease management",
    ],
  },
  {
    title: "Horticulture and greenhouse grower",
    description: "Grows vegetables, fruit or flowers in higher-value, more controlled conditions.",
    skills: [
      "Greenhouse and horticulture",
      "Irrigation management",
      "Pest and disease management",
      "Market linkage and sales",
    ],
  },
  {
    title: "Post-harvest and storage officer",
    description: "Reduces losses after harvest through drying, storage and handling.",
    skills: ["Post-harvest handling", "Farm record keeping", "Food processing and safety"],
  },
  {
    title: "Food processing technician",
    description: "Turns farm produce into safe, packaged products that earn more.",
    skills: ["Food processing and safety", "Post-harvest handling", "Farm record keeping"],
  },
  {
    title: "Agri-entrepreneur",
    description: "Runs a farm or agri-service business and sells to markets.",
    skills: [
      "Agri-business basics",
      "Market linkage and sales",
      "Farm record keeping",
      "Basic data and mobile tools",
    ],
  },
  {
    title: "Agri-drone operator",
    description: "Uses drones for crop monitoring, mapping and spraying services.",
    skills: ["Drone operation", "Basic data and mobile tools", "Crop production"],
  },
  {
    title: "Farm advisor (extension assistant)",
    description: "Helps farmers adopt better practices through training and field visits.",
    skills: [
      "Training and communication",
      "Crop production",
      "Soil health",
      "Basic data and mobile tools",
    ],
  },
];

// Links below were checked on 2026-10-23. Add more vetted courses over time; do not invent URLs.
const agritechCourses = [
  {
    title: "Implementation of Farmer Field School Programmes",
    provider: "FAO eLearning Academy",
    url: "https://elearning.fao.org/course/view.php?id=776",
    description:
      "Free online course on running farmer field schools, a group-learning approach to solving production problems. Needs a free FAO account.",
    isFree: true,
  },
  {
    title: "Browse all FAO eLearning courses",
    provider: "FAO eLearning Academy",
    url: "https://elearning.fao.org",
    description:
      "Free courses on agriculture and food systems. Some are written for professionals and advisors.",
    isFree: true,
  },
  {
    title: "Agriculture and food-processing programs",
    provider: "Rwanda Polytechnic",
    url: "https://www.rp.ac.rw",
    description:
      "TVET and higher-education programs, including agribusiness and food processing. Admission and fees apply.",
    isFree: false,
  },
  {
    title: "Extension services and farmer information",
    provider: "Rwanda Agriculture Board (RAB)",
    url: "https://www.rab.gov.rw",
    description:
      "Official source for farming guidance. Training is mainly delivered through extension officers and cooperatives, so ask your district agronomist.",
    isFree: true,
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin account");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: { email, passwordHash, name: "Administrator", role: "ADMIN" },
  });
}

// Demo accounts for local testing only. They are created only when TEST_USER_PASSWORD is set,
// so a production database never gets them unless someone sets that variable on purpose.
async function seedTestUsers() {
  const password = process.env.TEST_USER_PASSWORD;
  if (!password) {
    console.log("TEST_USER_PASSWORD not set, skipping demo accounts");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const agritech = await prisma.sector.findUniqueOrThrow({ where: { slug: "agritech" } });
  const now = new Date();

  const upsertUser = (
    email: string,
    name: string,
    role: "YOUTH" | "ORGANIZATION" | "TRAINING_PROVIDER",
  ) =>
    prisma.user.upsert({
      where: { email },
      update: { passwordHash, role },
      create: { email, name, role, passwordHash, ageConfirmedAt: now },
    });

  const youth = await upsertUser("youth.test@pathrwanda.local", "Demo Youth", "YOUTH");
  await prisma.profile.upsert({
    where: { userId: youth.id },
    update: {},
    create: { userId: youth.id },
  });

  const employer = await upsertUser(
    "employer.test@pathrwanda.local",
    "Demo Employer",
    "ORGANIZATION",
  );
  const farms = await prisma.organization.upsert({
    where: { ownerId: employer.id },
    update: { status: "APPROVED" },
    create: { ownerId: employer.id, name: "Demo Farms Ltd", type: "EMPLOYER", status: "APPROVED" },
  });

  const provider = await upsertUser(
    "provider.test@pathrwanda.local",
    "Demo Provider",
    "TRAINING_PROVIDER",
  );
  await prisma.organization.upsert({
    where: { ownerId: provider.id },
    update: {},
    create: {
      ownerId: provider.id,
      name: "Demo Training Centre",
      type: "TRAINING_PROVIDER",
      status: "PENDING",
    },
  });

  const title = "Greenhouse assistant (demo)";
  const existing = await prisma.listing.findFirst({ where: { organizationId: farms.id, title } });
  const closesAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  if (existing) {
    await prisma.listing.update({
      where: { id: existing.id },
      data: { closesAt, status: "ACTIVE" },
    });
  } else {
    await prisma.listing.create({
      data: {
        organizationId: farms.id,
        title,
        type: "JOB",
        description:
          "Demo listing: help run a tomato greenhouse, including watering, picking and record keeping.",
        applyInfo: "Demo only. There is nothing to apply for.",
        location: "Musanze",
        closesAt,
        sectors: { create: [{ sectorId: agritech.id }] },
      },
    });
  }
}

async function main() {
  for (const s of sectors) {
    await prisma.sector.upsert({ where: { slug: s.slug }, update: s, create: s });
  }

  await seedAdmin();
  await seedTestUsers();

  const agritech = await prisma.sector.findUniqueOrThrow({ where: { slug: "agritech" } });

  for (const name of agritechSkills) {
    await prisma.skill.upsert({
      where: { sectorId_name: { sectorId: agritech.id, name } },
      update: {},
      create: { name, sectorId: agritech.id },
    });
  }

  await prisma.careerPathway.deleteMany({ where: { sectorId: agritech.id } });
  for (const p of agritechPathways) {
    await prisma.careerPathway.create({
      data: {
        sectorId: agritech.id,
        title: p.title,
        description: p.description,
        skills: {
          connect: p.skills.map((name) => ({ sectorId_name: { sectorId: agritech.id, name } })),
        },
      },
    });
  }

  // Remove the earlier placeholder (a generic Coursera homepage link).
  await prisma.course.deleteMany({
    where: { sectorId: agritech.id, url: "https://www.coursera.org" },
  });
  for (const c of agritechCourses) {
    const existing = await prisma.course.findFirst({
      where: { sectorId: agritech.id, url: c.url },
    });
    if (existing) {
      await prisma.course.update({ where: { id: existing.id }, data: c });
    } else {
      await prisma.course.create({ data: { ...c, sectorId: agritech.id, checkedAt: new Date() } });
    }
  }
}

main()
  .then(() => console.log("Seed complete"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
