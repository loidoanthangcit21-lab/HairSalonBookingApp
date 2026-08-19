export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  name?: string;
  description: string;
  durationMinutes?: number;
  price: number;
  imageUrl: string;
  categoryId: string;
  categoryName?: string;
}

export interface Stylist {
  id: string;
  fullName: string;
  phone?: string;
  specialty?: string;
  rating?: number;
  experienceYears?: number;
  avatarUrl?: string;
  bio?: string;
  description?: string;
  isActive?: boolean;
  portfolioImages?: string[];
  categories?: ServiceCategory[];
}


