export type FallbackChefProfile = {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  reviewCount: number;
  specialty: string;
  bio: string;
};

export const fallbackChefProfiles: FallbackChefProfile[] = [
  {
    id: "marco-rossi",
    name: "Marco Rossi",
    role: "Executive Chef",
    image: "/chef-1.png",
    rating: 5.0,
    reviewCount: 124,
    specialty: "Italian Fine Dining",
    bio: "Leads premium event curation with a focus on heritage ingredients and refined plating.",
  },
  {
    id: "elena-vance",
    name: "Elena Vance",
    role: "Pastry Virtuoso",
    image:
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1977&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 89,
    specialty: "Artisan Desserts",
    bio: "Designs narrative dessert courses that blend precision technique with seasonal expression.",
  },
  {
    id: "kenji-sato",
    name: "Kenji Sato",
    role: "Sous Chef",
    image: "/chef-3.png",
    rating: 4.9,
    reviewCount: 102,
    specialty: "Modern Fusion",
    bio: "Builds contemporary menus around layered textures, bold aromatics, and global influences.",
  },
];

