// Realistic but made-up Agritech listings for local testing and demos. The organizations are
// fictional, and every listing says so in "how to apply", so nobody mistakes one for a real offer.

export const DEMO_APPLY_INFO =
  "This is a demo listing for testing PathRwanda. There is nothing to apply for.";

export type DemoOrganization = {
  key: string;
  email: string;
  ownerName: string;
  name: string;
  role: "ORGANIZATION" | "TRAINING_PROVIDER";
  type: "EMPLOYER" | "AGENCY" | "TRAINING_PROVIDER";
};

// "farms" is the demo employer that the seed has always created.
export const demoOrganizations: DemoOrganization[] = [
  {
    key: "coop",
    email: "coop.test@pathrwanda.local",
    ownerName: "Demo Cooperative Manager",
    name: "Demo Coffee Growers Cooperative",
    role: "ORGANIZATION",
    type: "EMPLOYER",
  },
  {
    key: "agency",
    email: "agency.test@pathrwanda.local",
    ownerName: "Demo Agency Officer",
    name: "Demo Youth Employment Agency",
    role: "ORGANIZATION",
    type: "AGENCY",
  },
  {
    key: "institute",
    email: "institute.test@pathrwanda.local",
    ownerName: "Demo Institute Registrar",
    name: "Demo Agri Skills Institute",
    role: "TRAINING_PROVIDER",
    type: "TRAINING_PROVIDER",
  },
];

export type DemoListing = {
  organization: "farms" | "coop" | "agency" | "institute";
  title: string;
  type: "JOB" | "TRAINING" | "PROGRAM";
  description: string;
  requirements?: string;
  location: string;
  // Days from the day the seed runs until the listing closes.
  closesInDays: number;
  skills: string[];
};

export const demoListings: DemoListing[] = [
  {
    organization: "farms",
    title: "Irrigation technician (demo)",
    type: "JOB",
    description:
      "Install and maintain drip irrigation lines on a 12-hectare vegetable farm. You will check pumps and filters every day, fix leaks, and keep a watering schedule for each block.",
    requirements: "TVET certificate in irrigation or plumbing, or one year of farm experience.",
    location: "Bugesera",
    closesInDays: 45,
    skills: ["Irrigation management", "Crop production", "Farm record keeping"],
  },
  {
    organization: "farms",
    title: "Farm records clerk (demo)",
    type: "JOB",
    description:
      "Record daily harvests, input use and worker hours on a tablet, and prepare a short weekly report for the farm manager. Training on the farm's record app is given in the first week.",
    requirements: "Secondary school certificate and basic smartphone skills.",
    location: "Rwamagana",
    closesInDays: 30,
    skills: ["Farm record keeping", "Basic data and mobile tools"],
  },
  {
    organization: "farms",
    title: "Pest scout for vegetable fields (demo)",
    type: "JOB",
    description:
      "Walk the tomato, pepper and cabbage fields twice a week to spot pests and diseases early. You will take photos, count affected plants and advise the spray team on what to treat.",
    requirements: "Knowledge of common vegetable pests. A diploma in crop science is an advantage.",
    location: "Rulindo",
    closesInDays: 60,
    skills: ["Pest and disease management", "Crop production", "Basic data and mobile tools"],
  },
  {
    organization: "farms",
    title: "Nursery and seedling attendant (demo)",
    type: "JOB",
    description:
      "Raise vegetable seedlings in trays inside a shade house: mix the growing medium, sow, water and harden off seedlings before they go to the field.",
    location: "Musanze",
    closesInDays: 25,
    skills: ["Greenhouse and horticulture", "Irrigation management", "Soil health"],
  },
  {
    organization: "farms",
    title: "Packhouse supervisor for export vegetables (demo)",
    type: "JOB",
    description:
      "Lead a team of ten sorting, grading and packing French beans and chillies for export. You will check quality against buyer standards and keep cold-room and traceability records.",
    requirements: "Two years in a packhouse or food factory. Food safety training is required.",
    location: "Kigali (Gasabo)",
    closesInDays: 40,
    skills: ["Post-harvest handling", "Food processing and safety", "Farm record keeping"],
  },
  {
    organization: "farms",
    title: "Agri-drone pilot trainee (demo)",
    type: "PROGRAM",
    description:
      "A six-month paid traineeship flying drones to map fields and spray crops. Trainees learn flight planning, safety rules and how to read crop-health maps, working beside a licensed pilot.",
    requirements: "Aged 18 to 30, comfortable with computers, and able to travel to field sites.",
    location: "Kayonza",
    closesInDays: 50,
    skills: ["Drone operation", "Basic data and mobile tools", "Crop production"],
  },
  {
    organization: "coop",
    title: "Coffee washing station assistant (demo)",
    type: "JOB",
    description:
      "Seasonal work during the coffee harvest: receive and weigh cherries from farmers, run the pulping machine, and turn parchment coffee on the drying tables.",
    location: "Nyamasheke",
    closesInDays: 35,
    skills: ["Post-harvest handling", "Farm record keeping"],
  },
  {
    organization: "coop",
    title: "Field officer for member farmers (demo)",
    type: "JOB",
    description:
      "Visit about 150 coffee farmers in three sectors to train them on pruning, mulching and soil cover, and record each visit in the cooperative's mobile app.",
    requirements:
      "Diploma in agriculture. You must speak Kinyarwanda and be able to ride a motorbike.",
    location: "Huye",
    closesInDays: 55,
    skills: ["Training and communication", "Soil health", "Basic data and mobile tools"],
  },
  {
    organization: "coop",
    title: "Coffee quality and cupping apprentice (demo)",
    type: "PROGRAM",
    description:
      "A four-month apprenticeship in the cooperative's quality lab. Learn to grade green coffee, roast samples and taste for defects, with a mentor who is a certified grader.",
    location: "Huye",
    closesInDays: 70,
    skills: ["Food processing and safety", "Post-harvest handling"],
  },
  {
    organization: "coop",
    title: "Sales and market linkage officer (demo)",
    type: "JOB",
    description:
      "Find buyers for the cooperative's roasted coffee and honey in Kigali shops, hotels and online. You will prepare price offers, follow up on orders and report sales every month.",
    requirements: "Experience in sales or customer service. Good English or French.",
    location: "Kigali (Nyarugenge)",
    closesInDays: 28,
    skills: ["Market linkage and sales", "Agri-business basics"],
  },
  {
    organization: "coop",
    title: "Maize drying and storage operator (demo)",
    type: "JOB",
    description:
      "Operate a grain dryer and manage hermetic storage bags for the cooperative's maize. You will test moisture, record stock coming in and out, and keep the store free of pests.",
    location: "Nyagatare",
    closesInDays: 42,
    skills: ["Post-harvest handling", "Pest and disease management", "Farm record keeping"],
  },
  {
    organization: "agency",
    title: "Youth agribusiness start-up programme (demo)",
    type: "PROGRAM",
    description:
      "A three-month programme for young people with a farm business idea. It covers business planning, simple bookkeeping and pitching, and the best ten plans receive a small start-up grant.",
    requirements: "Aged 18 to 30 with a business idea in farming or food.",
    location: "Kigali (Kicukiro)",
    closesInDays: 65,
    skills: ["Agri-business basics", "Market linkage and sales", "Farm record keeping"],
  },
  {
    organization: "agency",
    title: "Graduate internship in horticulture exports (demo)",
    type: "PROGRAM",
    description:
      "A six-month internship placing recent graduates with fruit and vegetable exporters. Interns rotate through the farm, the packhouse and the export documentation desk.",
    requirements:
      "A degree or diploma in agriculture, food science or business, finished in the last two years.",
    location: "Kigali (Gasabo)",
    closesInDays: 38,
    skills: ["Greenhouse and horticulture", "Post-harvest handling", "Market linkage and sales"],
  },
  {
    organization: "agency",
    title: "Village extension assistant (demo)",
    type: "JOB",
    description:
      "Support the sector agronomist by running farmer group meetings, setting up demonstration plots for beans and maize, and collecting planting data at the start of each season.",
    requirements: "Secondary school certificate in agriculture and good communication skills.",
    location: "Gicumbi",
    closesInDays: 33,
    skills: ["Training and communication", "Crop production", "Soil health"],
  },
  {
    organization: "agency",
    title: "Mobile data collector for a farm survey (demo)",
    type: "JOB",
    description:
      "A two-month contract interviewing farmers and recording answers on a tablet for a crop yield survey. Training is given, and transport between villages is paid.",
    requirements: "Own smartphone experience and willingness to travel in rural areas.",
    location: "Ngoma",
    closesInDays: 21,
    skills: ["Basic data and mobile tools", "Training and communication"],
  },
  {
    organization: "agency",
    title: "Fruit processing line worker (demo)",
    type: "JOB",
    description:
      "Wash, peel and prepare pineapples and passion fruit for juice and dried fruit in a small factory. Strict hygiene rules apply, and protective clothing is provided.",
    location: "Rusizi",
    closesInDays: 48,
    skills: ["Food processing and safety", "Post-harvest handling"],
  },
  {
    organization: "institute",
    title: "Short course: drip irrigation for small farms (demo)",
    type: "TRAINING",
    description:
      "A two-week practical course on designing, installing and looking after a drip irrigation system for plots under one hectare. Most of the time is spent in the training field.",
    location: "Bugesera",
    closesInDays: 30,
    skills: ["Irrigation management", "Crop production"],
  },
  {
    organization: "institute",
    title: "Certificate in greenhouse vegetable production (demo)",
    type: "TRAINING",
    description:
      "A three-month certificate covering greenhouse set-up, seedling production, feeding and watering, and pest control for tomatoes and sweet peppers. Includes a one-month attachment on a farm.",
    requirements: "Secondary school certificate. Fees apply; a few scholarships are available.",
    location: "Musanze",
    closesInDays: 75,
    skills: ["Greenhouse and horticulture", "Irrigation management", "Pest and disease management"],
  },
  {
    organization: "institute",
    title: "Food safety and hygiene for processors (demo)",
    type: "TRAINING",
    description:
      "A five-day course for people working with milk, fruit or grain products. It covers clean handling, safe storage, labelling and the basic records a processor must keep.",
    location: "Kigali (Kicukiro)",
    closesInDays: 26,
    skills: ["Food processing and safety", "Farm record keeping"],
  },
  {
    organization: "institute",
    title: "Soil testing and fertiliser planning workshop (demo)",
    type: "TRAINING",
    description:
      "A three-day workshop on taking soil samples, reading a soil test report, and planning lime, compost and fertiliser for common crops.",
    location: "Nyanza",
    closesInDays: 52,
    skills: ["Soil health", "Crop production"],
  },
  {
    organization: "institute",
    title: "Drone operation for agriculture: beginner course (demo)",
    type: "TRAINING",
    description:
      "A four-week course on flying small drones safely, planning mapping flights and turning the pictures into simple field maps. Drones are provided during the course.",
    requirements: "Aged 18 or older with basic computer skills. Fees apply.",
    location: "Kigali (Gasabo)",
    closesInDays: 60,
    skills: ["Drone operation", "Basic data and mobile tools"],
  },
  {
    organization: "institute",
    title: "Farm business and record keeping evening class (demo)",
    type: "TRAINING",
    description:
      "An eight-week evening class, twice a week, on costing a crop, keeping a cash book, pricing produce and dealing with buyers. It suits people who already farm or plan to start.",
    location: "Muhanga",
    closesInDays: 36,
    skills: ["Agri-business basics", "Farm record keeping", "Market linkage and sales"],
  },
  {
    organization: "institute",
    title: "Training of trainers for farmer field schools (demo)",
    type: "TRAINING",
    description:
      "A two-week course that prepares young agronomists to lead farmer field schools: adult teaching methods, planning a season of sessions and running field experiments with a group.",
    requirements: "Diploma in agriculture or experience working with farmer groups.",
    location: "Rubavu",
    closesInDays: 58,
    skills: ["Training and communication", "Crop production", "Pest and disease management"],
  },
];
