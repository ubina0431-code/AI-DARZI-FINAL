const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ai_darzi_jwt_secret_key_2026_super_secure';

// Initial preloaded mock datasets
const defaultUsers = [
  {
    _id: "user_cust_amina",
    name: "Amina Khan",
    email: "amina.khan@example.com",
    password: "$2a$10$w8T0p0a7u0kE.VwVfXW8xOX8v.WjK2z9vEwJb5u0F4sT3Z2.O4rS.", // "password123"
    phone: "+92 300 1234567",
    role: "customer",
    city: "Karachi",
    address: "House 12-A, Khayaban-e-Shamsheer, DHA Phase 5, Karachi",
    privacyPreferences: {
      hidePhotosFromTailor: true,
      onlyShareMeasurements: true,
      allowTailorDirectCalls: false
    },
    createdAt: new Date()
  },
  {
    _id: "user_tailor_rafiq",
    name: "Master Muhammad Rafiq",
    email: "rafiq.tailor@example.com",
    password: "$2a$10$w8T0p0a7u0kE.VwVfXW8xOX8v.WjK2z9vEwJb5u0F4sT3Z2.O4rS.", // "password123"
    phone: "+92 300 8456123",
    role: "tailor",
    city: "Lahore",
    address: "Shop 14-B, Fashion Avenue, Gulberg III, Lahore",
    businessName: "Master Rafiq Haute Couture",
    createdAt: new Date()
  },
  {
    _id: "user_admin_01",
    name: "AI Darzi Administrator",
    email: "admin@aidarzi.pk",
    password: "$2a$10$w8T0p0a7u0kE.VwVfXW8xOX8v.WjK2z9vEwJb5u0F4sT3Z2.O4rS.", // "admin123"
    phone: "+92 300 0000000",
    role: "admin",
    city: "Islamabad",
    createdAt: new Date()
  }
];

const defaultTailors = [
  {
    _id: "tailor_001",
    businessName: "Master Rafiq Haute Couture",
    masterTailorName: "Master Muhammad Rafiq",
    city: "Lahore",
    area: "Gulberg III, near MM Alam Road",
    fullAddress: "Shop 14-B, Fashion Avenue, Gulberg III, Lahore",
    phone: "+92 300 8456123",
    bio: "Over 25 years of master tailoring experience specializing in designer lawn suits, intricate gala piping, organza cutwork, and bespoke bridal wear. Renowned for perfect fit and timely delivery.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    coverImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80",
    rating: 4.95,
    reviewCount: 342,
    completedOrders: 1420,
    startingPrice: 1800,
    turnaroundDays: 3,
    specialties: ["Ladies 3-Piece Lawn", "Designer Gala & Sleeves", "Bridal Lehengas", "Piping & Organza Trims"],
    categories: ["ladies", "bridal", "formal", "casual", "embroidery"],
    services: [
      { name: "3-Piece Lawn / Cotton Suit Stitching", category: "ladies", basePrice: 2200, turnaroundDays: 3, description: "Includes designer neckline, sleeve finishing, and standard trousers/shalwar." },
      { name: "Luxury Chiffon / Silk Formal Suit", category: "formal", basePrice: 3800, turnaroundDays: 5, description: "Includes full astra/lining attachment, delicate piping, and custom buttoning." },
      { name: "Bridal Maxi / Lehenga Choli", category: "bridal", basePrice: 14000, turnaroundDays: 12, description: "Haute couture bridal cut with cancan netting and hand-embroidery placement." },
      { name: "Trousers / Cigarette Pants Stitching", category: "casual", basePrice: 900, turnaroundDays: 2, description: "Tailored fit with pintucks, lace insertions, or side slit." }
    ],
    portfolio: [
      { title: "Mint Emerald Lawn with Organza Cuffs", garmentType: "3-Piece Suit", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80", description: "Delicate neck placket with pearl tassels and scalloped sleeve borders." },
      { title: "Blush Pink Kalidar Frock", garmentType: "Frock", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80", description: "16-kali flowy silhouette with gold gota trims on daman." },
      { title: "Ivory & Gold Formal Kurti", garmentType: "Kurti", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80", description: "Ban collar with hand-worked resham and crystal button loops." }
    ],
    pickupAvailable: true,
    deliveryAvailable: true,
    pickupDeliveryFee: 300,
    serviceRadiusKm: 20,
    verified: true,
    availableNow: true,
    workingHours: "10:30 AM - 9:30 PM (Mon - Sat)"
  },
  {
    _id: "tailor_002",
    businessName: "Noor-e-Kainat Boutique & Tailors",
    masterTailorName: "Madam Kainat & Master Saleem",
    city: "Karachi",
    area: "Clifton, Block 4",
    fullAddress: "Plot 8-C, Sunset Commercial, Clifton Block 4, Karachi",
    phone: "+92 321 2345890",
    bio: "Female-led tailoring boutique providing privacy-first, bespoke ladies stitching. Specializes in luxury unstitched designer lawn (Sana Safinaz, Maria.B, Crimson) with exact designer look reconstruction.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    coverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
    rating: 4.92,
    reviewCount: 289,
    completedOrders: 980,
    startingPrice: 2000,
    turnaroundDays: 4,
    specialties: ["Designer Lawn Replication", "Women Privacy-First", "Party Wear", "Lace & Cutwork Insertion"],
    categories: ["ladies", "formal", "casual", "alterations"],
    services: [
      { name: "Boutique 3-Piece Designer Lawn", category: "ladies", basePrice: 2500, turnaroundDays: 4, description: "Precision designer look matching catalog booklet with lace/organza inserts." },
      { name: "Velvet Winter Long Shirt & Pants", category: "formal", basePrice: 3500, turnaroundDays: 5, description: "Micro-velvet stitching with silk facing and anti-stretch inner canvas." },
      { name: "Emergency Alterations & Fitting", category: "alterations", basePrice: 600, turnaroundDays: 1, description: "Chest, waist, and length adjustment within 24 hours." }
    ],
    portfolio: [
      { title: "Sapphire Blue Embroidered Lawn", garmentType: "3-Piece Suit", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80", description: "Catalog replica with complex sleeve lace extensions and straight trousers." },
      { title: "Crimson Silk Evening Caftan", garmentType: "Caftan", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80", description: "Modern drape with gold zari cords on neckline." }
    ],
    pickupAvailable: true,
    deliveryAvailable: true,
    pickupDeliveryFee: 350,
    serviceRadiusKm: 25,
    verified: true,
    availableNow: true,
    workingHours: "11:00 AM - 8:00 PM (All week)"
  },
  {
    _id: "tailor_003",
    businessName: "Tariq Road Heritage Master Darzi",
    masterTailorName: "Ustad Tariq Mehmood",
    city: "Karachi",
    area: "Tariq Road, PECHS",
    fullAddress: "Shop 45, Kurta Street, Tariq Road, Karachi",
    phone: "+92 333 9988112",
    bio: "Master gents tailor recognized across Karachi for impeccable cut in Kurta Shalwar, Boski, Wash & Wear, Embroidered Waistcoats, and traditional Sherwanis.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
    coverImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80",
    rating: 4.88,
    reviewCount: 410,
    completedOrders: 2100,
    startingPrice: 1500,
    turnaroundDays: 2,
    specialties: ["Gents Kurta Shalwar", "Boski Silk Suit", "Embroidered Waistcoat", "Ban Collar"],
    categories: ["gents", "traditional", "formal", "casual"],
    services: [
      { name: "Gents Kurta Shalwar (Classic / Slim)", category: "gents", basePrice: 1600, turnaroundDays: 2, description: "German fusing on ban collar, cuff buttons, and single/double chest pocket." },
      { name: "Traditional Boski Suit Tailoring", category: "gents", basePrice: 2400, turnaroundDays: 3, description: "Specialized non-crease stitching for pure Chinese and local Boski silks." }
    ],
    pickupAvailable: true,
    deliveryAvailable: true,
    pickupDeliveryFee: 250,
    serviceRadiusKm: 30,
    verified: true,
    availableNow: true,
    workingHours: "10:00 AM - 10:00 PM (Mon - Sat)"
  },
  {
    _id: "tailor_004",
    businessName: "Kohsar Signature Tailors",
    masterTailorName: "Master Zahid Abbasi",
    city: "Islamabad",
    area: "F-6 Super Market",
    fullAddress: "Mezzanine Floor, Kohsar Plaza, F-6 Markaz, Islamabad",
    phone: "+92 301 5566778",
    bio: "Serving Islamabad and diplomatic corps for 18 years. Premium fusion tailoring for ladies and gentlemen. Clean minimalist silhouettes and contemporary eastern wear.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80",
    rating: 4.85,
    reviewCount: 195,
    completedOrders: 750,
    startingPrice: 2200,
    turnaroundDays: 3,
    specialties: ["Modern Eastern Fusion", "Pants & Blazers", "Linen & Khaddar"],
    categories: ["ladies", "gents", "western", "formal"],
    services: [
      { name: "Contemporary Eastern 2-Piece", category: "ladies", basePrice: 2200, turnaroundDays: 3, description: "Modern boxy kurta with cigarette trousers." }
    ],
    pickupAvailable: true,
    deliveryAvailable: true,
    pickupDeliveryFee: 300,
    serviceRadiusKm: 25,
    verified: true,
    availableNow: true,
    workingHours: "11:00 AM - 9:00 PM (Mon - Sat)"
  },
  {
    _id: "tailor_005",
    businessName: "Anarkali Traditional Zardozi & Stitching",
    masterTailorName: "Ustad Ghulam Rasool",
    city: "Lahore",
    area: "Bano Bazaar, Old Anarkali",
    fullAddress: "Shop 12, Gota Galli, Old Anarkali, Lahore",
    phone: "+92 322 4455667",
    bio: "Generational royal artisans known for heritage bridal wear, hand zardozi, gota kinari, and traditional Gharara/Sharara tailoring.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    coverImage: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
    rating: 4.96,
    reviewCount: 310,
    completedOrders: 890,
    startingPrice: 3500,
    turnaroundDays: 7,
    specialties: ["Bridal Lehengas", "Traditional Ghararas", "Hand Zardozi & Gota"],
    categories: ["bridal", "traditional", "embroidery", "ladies"],
    services: [
      { name: "Royal Bridal Lehenga & Choli", category: "bridal", basePrice: 16000, turnaroundDays: 14, description: "Heavy bridal construction with double cancan." }
    ],
    pickupAvailable: false,
    deliveryAvailable: true,
    pickupDeliveryFee: 400,
    serviceRadiusKm: 35,
    verified: true,
    availableNow: true,
    workingHours: "12:00 PM - 10:00 PM (Mon - Sat)"
  }
];

const defaultMeasurements = [
  {
    _id: "meas_001",
    userId: "user_cust_amina",
    profileName: "My Measurements",
    gender: "female",
    garmentType: "Shalwar Kameez",
    measurements: {
      kameezLength: 39.5,
      teera: 14.5,
      chest: 37,
      waist: 31,
      hip: 41,
      daman: 23.5,
      sleevesLength: 21,
      trouserLength: 37.5,
      paincha: 6.5,
      collar: 14.5
    },
    source: "ai_camera",
    confidenceScore: 96,
    notes: "Tailored fit with 1.5 inch comfort ease for lawn fabric.",
    lastUpdated: new Date()
  },
  {
    _id: "meas_002",
    userId: "user_cust_amina",
    profileName: "Ammi (Mother)",
    gender: "female",
    garmentType: "Shalwar Kameez",
    measurements: {
      kameezLength: 42,
      teera: 15.5,
      chest: 41.5,
      waist: 37,
      hip: 45,
      daman: 26,
      sleevesLength: 20,
      trouserLength: 38,
      paincha: 7.5,
      collar: 15.5
    },
    source: "manual",
    confidenceScore: 100,
    notes: "Traditional relaxed cut with extra wide daman flare.",
    lastUpdated: new Date()
  },
  {
    _id: "meas_003",
    userId: "user_cust_amina",
    profileName: "Brother (Hamza)",
    gender: "male",
    garmentType: "Kurta Shalwar",
    measurements: {
      kameezLength: 42,
      teera: 18,
      chest: 41,
      waist: 36,
      daman: 24,
      sleevesLength: 24.5,
      trouserLength: 40,
      paincha: 8.5,
      collar: 16
    },
    source: "garment_photo",
    confidenceScore: 94,
    notes: "Measured from well-fitting Junaid Jamshed kurta.",
    lastUpdated: new Date()
  }
];

const defaultOrders = [
  {
    _id: "order_001",
    orderNumber: "AD-2026-891",
    customerId: "user_cust_amina",
    customerName: "Amina Khan",
    customerPhone: "+92 300 1234567",
    customerCity: "Karachi",
    customerAddress: "Clifton Phase 5, Karachi",
    tailorId: "tailor_002",
    tailorName: "Noor-e-Kainat Boutique & Tailors",
    garmentCategory: "ladies",
    garmentType: "3-Piece Lawn Suit",
    designTitle: "Emerald Breeze Festive Lawn Suit",
    designDetails: {
      neckline: "Boat Neck with 3-inch Slit & Potli Buttons",
      sleeves: "Straight with Scalloped Embroidered Cuffs",
      length: "Calf-length (40 inches)",
      trouser: "Straight Trousers with Three Pintucks",
      dupatta: "Pure Chiffon with 4-Side Gold Pico Trimming",
      embroidery: "Delicate resham floral embroidery along cuffs and neckline",
      specialInstructions: "Please use soft organza on sleeves so it doesn't prick the skin."
    },
    measurements: {
      profileName: "My Measurements",
      kameezLength: 39.5,
      teera: 14.5,
      chest: 37,
      waist: 31,
      daman: 23.5,
      sleevesLength: 21,
      trouserLength: 37.5,
      paincha: 6.5,
      collar: 14.5
    },
    fabricOption: "customer_pickup",
    fabricName: "Maria.B Summer Lawn Unstitched (3 Pieces)",
    fabricColor: "Royal Emerald",
    logisticsOption: {
      pickupType: "tailor_pickup",
      deliveryType: "home_delivery"
    },
    pricing: {
      tailoring: 2500,
      fabric: 0,
      embroidery: 500,
      pickup: 150,
      delivery: 200,
      platformFee: 100,
      tax: 0,
      total: 3450
    },
    payment: {
      method: "jazzcash_easypaisa",
      status: "deposit_paid"
    },
    deadlineDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: "Stitching",
    statusHistory: [
      { status: "New Order", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: "Order placed via AI Darzi app.", updatedBy: "Amina Khan" },
      { status: "Reviewing", timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000), note: "Fabric requirements verified.", updatedBy: "Madam Kainat" },
      { status: "Quotation Sent", timestamp: new Date(Date.now() - 2.4 * 60 * 60 * 1000), note: "PKR 3,450 quoted with pickup & home delivery.", updatedBy: "Madam Kainat" },
      { status: "Accepted", timestamp: new Date(Date.now() - 2.2 * 24 * 60 * 60 * 1000), note: "Quotation accepted by customer.", updatedBy: "Amina Khan" },
      { status: "Fabric Received", timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), note: "Fabric picked up by rider from Clifton.", updatedBy: "Rider Ali" },
      { status: "Cutting", timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), note: "Master cutter completed pre-shrink and precision cutting.", updatedBy: "Master Saleem" },
      { status: "Stitching", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), note: "Kameez panels and neck piping currently on machine.", updatedBy: "Master Saleem" }
    ],
    tailorOrderSheet: `TAILOR ORDER SHEET\n=============================================\nOrder #: AD-2026-891\nCustomer: Amina Khan (+92 300 1234567)\nDelivery Address: Clifton Phase 5, Karachi\nTailor: Noor-e-Kainat Boutique\nGarment: 3-Piece Lawn Suit\nMeasurements (Inches):\n- Kameez Length: 39.5 | Teera: 14.5 | Chest: 37.0 | Waist: 31.0\n- Daman: 23.5 | Sleeves: 21.0 | Trouser: 37.5 | Paincha: 6.5\nStatus: Stitching`
  },
  {
    _id: "order_002",
    orderNumber: "AD-2026-892",
    customerId: "user_cust_amina",
    customerName: "Amina Khan",
    customerPhone: "+92 300 1234567",
    customerCity: "Karachi",
    customerAddress: "Clifton Phase 5, Karachi",
    tailorId: "tailor_001",
    tailorName: "Master Rafiq Haute Couture",
    garmentCategory: "ladies",
    garmentType: "Velvet Winter Kurti",
    designTitle: "Royal Velvet Kurti with Gold Zari",
    measurements: {
      profileName: "My Measurements",
      kameezLength: 38,
      teera: 14.5,
      chest: 37,
      waist: 31,
      daman: 23,
      sleevesLength: 21,
      trouserLength: 37.5,
      paincha: 6.5
    },
    fabricOption: "customer_pickup",
    fabricName: "Micro 9000 Velvet (Navy Blue)",
    pricing: {
      tailoring: 2800,
      fabric: 0,
      embroidery: 700,
      pickup: 150,
      delivery: 200,
      platformFee: 100,
      tax: 0,
      total: 3950
    },
    payment: {
      method: "cash_on_delivery",
      status: "pending"
    },
    status: "Cutting",
    statusHistory: [
      { status: "New Order", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), note: "Order placed.", updatedBy: "Amina Khan" },
      { status: "Reviewing", timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), note: "Approved.", updatedBy: "Master Rafiq" },
      { status: "Fabric Received", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), note: "Fabric safely received at workshop.", updatedBy: "Master Rafiq" },
      { status: "Cutting", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), note: "Master cutting in progress.", updatedBy: "Master Rafiq" }
    ]
  }
];

const defaultReviews = [
  {
    _id: "rev_001",
    tailorId: "tailor_001",
    customerId: "user_cust_amina",
    customerName: "Dr. Ayesha Malik",
    rating: 5,
    stitchingQuality: 5,
    accuracy: 5,
    communication: 5,
    deliveryTime: 5,
    comment: "Master Rafiq did an incredible job! The neck piping and armhole fitting are so clean. Did not have to step out of my house once. Truly life-changing service for busy working women.",
    verifiedOrder: true,
    createdAt: new Date()
  },
  {
    _id: "rev_002",
    tailorId: "tailor_002",
    customerId: "user_cust_amina",
    customerName: "Sana Tariq",
    rating: 5,
    stitchingQuality: 5,
    accuracy: 5,
    communication: 5,
    deliveryTime: 5,
    comment: "Madam Kainat replicated the Maria.B catalog design 100%! All laces and organza cuts were exact. Fast pickup and delivery in Clifton.",
    verifiedOrder: true,
    createdAt: new Date()
  }
];

const defaultMessages = [
  {
    _id: "msg_001",
    orderId: "order_001",
    orderNumber: "AD-2026-891",
    senderId: "user_cust_amina",
    senderName: "Amina Khan",
    senderRole: "customer",
    recipientId: "tailor_002",
    text: "Assalam-o-Alaikum Madam Kainat, please ensure the organza border on the sleeves is lined with soft lawn so it is comfortable to wear.",
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    _id: "msg_002",
    orderId: "order_001",
    orderNumber: "AD-2026-891",
    senderId: "tailor_002",
    senderName: "Madam Kainat",
    senderRole: "tailor",
    recipientId: "user_cust_amina",
    text: "Walaikum Assalam Amina baji. Ji bilkul, hum hamesha organza borders ke neeche skin-friendly pure lawn astra lagatay hain. Stitching shuru ho chuki hai!",
    createdAt: new Date(Date.now() - 1800000)
  }
];

const defaultDesigns = [
  {
    _id: "design_001",
    userId: "user_cust_amina",
    title: "Emerald Breeze Festive Lawn Suit",
    prompt: "Design a luxury 3-piece Eid lawn suit in emerald green with resham embroidery on sleeves and scalloped organza dupatta border",
    gender: "ladies",
    garmentType: "3-Piece Lawn Suit",
    fabric: "Premium 80/80 Lawn",
    colorPalette: ["#0B2B26", "#D4AF37", "#FAF8F5", "#2D5A4C"],
    pattern: "Floral Jaal & Geometrical Accents",
    neckline: "Boat Neck with 3-inch Slit & Potli Buttons",
    sleevesStyle: "Straight with Scalloped Embroidered Cuffs",
    trouserStyle: "Straight Trousers with Three Pintucks",
    dupattaStyle: "Pure Chiffon with 4-Side Gold Pico Trimming",
    embroideryDetails: "Delicate resham floral embroidery along cuffs and neckline",
    lengthStyle: "Calf-length (40 inches)",
    occasion: "Eid-ul-Fitr",
    estimatedBudget: "PKR 3,500 - 4,500",
    tailorInstructions: "1. Pre-shrink unstitched lawn thoroughly.\n2. Keep 2 inches side chaak seam allowances.\n3. Turn hemline with 1-inch matching green silk piping.",
    variations: [
      { label: "Formal Edition", description: "Add gold tilla border on daman and pearls on neck placket." },
      { label: "Casual Everyday", description: "Simple plain sleeves and narrow cotton trousers." }
    ],
    createdAt: new Date()
  }
];

// Memory Data Registry
const memoryDB = {
  users: [...defaultUsers],
  tailors: [...defaultTailors],
  measurements: [...defaultMeasurements],
  orders: [...defaultOrders],
  reviews: [...defaultReviews],
  messages: [...defaultMessages],
  designs: [...defaultDesigns]
};

module.exports = { memoryDB };
