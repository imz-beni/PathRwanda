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
  "Post-harvest handling",
  "Farm record keeping",
  "Agri-business basics",
  "Basic data and mobile tools",
  "Drone operation",
];

const agritechPathways = [
  {
    title: "Farm technician",
    description: "Supports day-to-day crop production using improved inputs and irrigation.",
    skills: ["Crop production", "Irrigation management", "Soil health"],
  },
  {
    title: "Post-harvest and value-addition officer",
    description: "Reduces losses and adds value through storage, drying and processing.",
    skills: ["Post-harvest handling", "Farm record keeping"],
  },
  {
    title: "Agri-entrepreneur",
    description: "Runs a farm or agri-service business and sells to markets.",
    skills: ["Agri-business basics", "Farm record keeping", "Basic data and mobile tools"],
  },
  {
    title: "Agri-drone operator",
    description: "Uses drones for crop monitoring and spraying services.",
    skills: ["Drone operation", "Basic data and mobile tools"],
  },
];

// Starter links point to provider catalogues. Vet and replace with specific courses before launch.
const agritechCourses = [
  {
    title: "FAO eLearning Academy catalogue",
    provider: "FAO",
    url: "https://elearning.fao.org",
    description: "Free courses on agriculture and food systems.",
  },
  {
    title: "Introductory agriculture courses",
    provider: "Coursera",
    url: "https://www.coursera.org",
    description: "Audit-for-free options available on many courses.",
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

async function main() {
  for (const s of sectors) {
    await prisma.sector.upsert({ where: { slug: s.slug }, update: s, create: s });
  }

  await seedAdmin();

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

  await prisma.course.deleteMany({ where: { sectorId: agritech.id, progress: { none: {} } } });
  for (const c of agritechCourses) {
    await prisma.course.create({ data: { ...c, sectorId: agritech.id } });
  }
}

main()
  .then(() => console.log("Seed complete"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
