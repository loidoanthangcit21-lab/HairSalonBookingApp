export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  imageUrl: string;
  categoryId: string;
  categoryName?: string;
}

export interface Stylist {
  id: string;
  fullName: string;
  specialty: string;
  rating: number;
  experienceYears: number;
  avatarUrl: string;
  bio: string;
  portfolioImages: string[];
}
