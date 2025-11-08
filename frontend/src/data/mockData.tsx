import React from "react";
export interface Property {
  id: string;
  title: string;
  description: string;
  type: "pg" | "flat" | "house" | "commercial" | "land";
  for: "rent" | "sale";
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  furnishing?: "furnished" | "semifurnished" | "unfurnished";
  amenities?: string[];
  images: string[];
  listedDate: string;
  owner: {
    name: string;
    phone: string;
    email: string;
  };

  distanceMeters?: number;
}
export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Modern 2BHK Apartment in Koramangala",
    description:
      "Spacious 2BHK apartment with modern amenities. The apartment features a large living room, two bedrooms with attached bathrooms, a fully equipped kitchen, and a balcony with a great view. Located in a secure gated community with 24/7 security, power backup, and water supply. Close to major IT parks, shopping malls, restaurants, and hospitals.",
    type: "flat",
    for: "rent",
    price: 25000,
    location: "Koramangala, Bangalore",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    furnishing: "furnished",
    amenities: ["WiFi", "Parking", "TV", "AC", "Gym", "Swimming Pool"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-10",
    owner: {
      name: "Rahul Sharma",
      phone: "+91 9876543210",
      email: "rahul.sharma@example.com",
    },
  },
  {
    id: "2",
    title: "PG Accommodation for Women in HSR Layout",
    description:
      "Fully furnished PG accommodation for women with all modern amenities. Single and sharing options available. The PG offers comfortable beds, study tables, cupboards, and attached bathrooms. Common facilities include a dining area, TV room, washing machine, and high-speed internet. Located in a safe neighborhood with easy access to public transportation.",
    type: "pg",
    for: "rent",
    price: 9000,
    location: "HSR Layout, Bangalore",
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "furnished",
    amenities: ["WiFi", "Laundry", "Security", "Cafeteria", "TV", "AC"],
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-15",
    owner: {
      name: "Priya Patel",
      phone: "+91 9876543211",
      email: "priya.patel@example.com",
    },
  },
  {
    id: "3",
    title: "3BHK Independent House in Indiranagar",
    description:
      "Beautiful 3BHK independent house with a private garden and parking. The house features three spacious bedrooms, a large living and dining area, a modern kitchen, and a study room. It has 3 bathrooms, a private garden, and covered parking for two cars. Located in a quiet residential area with easy access to schools, markets, and public transportation.",
    type: "house",
    for: "sale",
    price: 12500000,
    location: "Indiranagar, Bangalore",
    bedrooms: 3,
    bathrooms: 3,
    area: 2000,
    furnishing: "semifurnished",
    amenities: ["Parking", "Security", "Garden"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-05",
    owner: {
      name: "Arun Kumar",
      phone: "+91 9876543212",
      email: "arun.kumar@example.com",
    },
  },
  {
    id: "4",
    title: "Commercial Office Space in Whitefield",
    description:
      "Prime commercial office space available for rent in a corporate building. The office space is well-designed with modern interiors, cubicles, conference rooms, and a reception area. It comes with essential facilities like high-speed internet, power backup, central air conditioning, and 24/7 security. Located in a business district with easy access to public transportation and amenities.",
    type: "commercial",
    for: "rent",
    price: 85000,
    location: "Whitefield, Bangalore",
    area: 1500,
    furnishing: "furnished",
    amenities: ["Parking", "Security", "WiFi", "AC"],
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-12",
    owner: {
      name: "Vikram Singh",
      phone: "+91 9876543213",
      email: "vikram.singh@example.com",
    },
  },
  {
    id: "5",
    title: "Residential Plot in Electronic City",
    description:
      "Residential plot in a gated community with BBMP approved layout. The plot is located in a developing area with good appreciation potential. It has access to water, electricity, and sewage connections. The plot is located in a well-planned layout with wide roads, parks, and community spaces. It is close to schools, hospitals, and shopping centers.",
    type: "land",
    for: "sale",
    price: 6000000,
    location: "Electronic City, Bangalore",
    area: 2400,
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1542319630-55fb7f7c944a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-08",
    owner: {
      name: "Sanjay Reddy",
      phone: "+91 9876543214",
      email: "sanjay.reddy@example.com",
    },
  },
  {
    id: "6",
    title: "Luxury 4BHK Villa in Sarjapur Road",
    description:
      "Exquisite 4BHK villa with premium amenities and modern design. The villa features four spacious bedrooms with attached bathrooms, a large living room, dining area, modular kitchen, and a private garden. It also has a home theater, study room, and servant quarters. Located in a gated community with amenities like clubhouse, swimming pool, gym, and children's play area.",
    type: "house",
    for: "sale",
    price: 28000000,
    location: "Sarjapur Road, Bangalore",
    bedrooms: 4,
    bathrooms: 4,
    area: 3500,
    furnishing: "unfurnished",
    amenities: ["Parking", "Security", "Garden", "Swimming Pool", "Gym"],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-01",
    owner: {
      name: "Neha Gupta",
      phone: "+91 9876543215",
      email: "neha.gupta@example.com",
    },
  },
  {
    id: "7",
    title: "PG for Men near Manyata Tech Park",
    description:
      "Well-maintained PG accommodation for men close to Manyata Tech Park. The PG offers comfortable single and sharing rooms with basic amenities. Each room has beds, cupboards, and study tables. Common facilities include a dining area, TV room, and WiFi. Meals are provided three times a day. Located just 10 minutes walk from Manyata Tech Park, making it ideal for IT professionals.",
    type: "pg",
    for: "rent",
    price: 8000,
    location: "Hebbal, Bangalore",
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "furnished",
    amenities: ["WiFi", "Cafeteria", "TV", "Security"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-18",
    owner: {
      name: "Ramesh Joshi",
      phone: "+91 9876543216",
      email: "ramesh.joshi@example.com",
    },
  },
  {
    id: "8",
    title: "1BHK Flat for Rent in JP Nagar",
    description:
      "Cozy 1BHK apartment available for rent in JP Nagar. The apartment features a spacious bedroom, living room, kitchen, and bathroom. It is located on the 3rd floor of a well-maintained building with elevator access. The apartment gets ample natural light and ventilation. It is close to markets, restaurants, and public transportation.",
    type: "flat",
    for: "rent",
    price: 15000,
    location: "JP Nagar, Bangalore",
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    furnishing: "semifurnished",
    amenities: ["Parking", "Security"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-14",
    owner: {
      name: "Meera Nair",
      phone: "+91 9876543217",
      email: "meera.nair@example.com",
    },
  },
  {
    id: "9",
    title: "Retail Shop Space in Commercial Complex",
    description:
      "Prime retail shop space available in a busy commercial complex. The shop is located on the ground floor with high visibility and footfall. It has a large display window, storage area, and bathroom. The complex has dedicated parking for customers and security. Ideal for retail businesses, showrooms, or service centers.",
    type: "commercial",
    for: "rent",
    price: 45000,
    location: "MG Road, Bangalore",
    area: 500,
    furnishing: "unfurnished",
    amenities: ["Parking", "Security"],
    images: [
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-11",
    owner: {
      name: "Suresh Menon",
      phone: "+91 9876543218",
      email: "suresh.menon@example.com",
    },
  },
  {
    id: "10",
    title: "Premium 3BHK Apartment in Prestige Complex",
    description:
      "Luxurious 3BHK apartment in the prestigious Prestige complex. The apartment features three spacious bedrooms with attached bathrooms, a large living and dining area, a modern kitchen with built-in appliances, and a balcony with a garden view. The complex offers amenities like swimming pool, gym, clubhouse, children's play area, and landscaped gardens.",
    type: "flat",
    for: "sale",
    price: 15000000,
    location: "Bannerghatta Road, Bangalore",
    bedrooms: 3,
    bathrooms: 3,
    area: 1800,
    furnishing: "unfurnished",
    amenities: ["Parking", "Security", "Swimming Pool", "Gym", "Clubhouse"],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-07",
    owner: {
      name: "Anita Desai",
      phone: "+91 9876543219",
      email: "anita.desai@example.com",
    },
  },
  {
    id: "11",
    title: "Spacious 2BHK Flat near Metro Station",
    description:
      "Well-maintained 2BHK apartment just 5 minutes walk from the metro station. The apartment features two bedrooms with attached bathrooms, a spacious living room, dining area, and a modern kitchen. It is located on the 5th floor with elevator access and offers a good view of the city. The building has power backup, water supply, and security.",
    type: "flat",
    for: "rent",
    price: 22000,
    location: "Jayanagar, Bangalore",
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    furnishing: "semifurnished",
    amenities: ["Parking", "Security"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-16",
    owner: {
      name: "Rajesh Khanna",
      phone: "+91 9876543220",
      email: "rajesh.khanna@example.com",
    },
  },
  {
    id: "12",
    title: "Industrial Warehouse Space in Peenya",
    description:
      "Large industrial warehouse space available for rent in Peenya Industrial Area. The warehouse has a high ceiling, loading/unloading dock, and ample storage space. It is equipped with basic facilities like electricity, water, and security. Suitable for manufacturing, storage, or distribution operations. Good connectivity to major highways and transportation hubs.",
    type: "commercial",
    for: "rent",
    price: 120000,
    location: "Peenya, Bangalore",
    area: 5000,
    furnishing: "unfurnished",
    amenities: ["Parking", "Security"],
    images: [
      "https://images.unsplash.com/photo-1565610222536-ef113ca7f80f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80",
    ],
    listedDate: "2023-05-09",
    owner: {
      name: "Harish Mehta",
      phone: "+91 9876543221",
      email: "harish.mehta@example.com",
    },
  },
];
