import { ServiceCategory, ServiceItem, Stylist } from '../types/service';

export const MOCK_CATEGORIES: ServiceCategory[] = [
  { id: 'cat_1', name: 'Haircut', icon: 'content-cut' },
  { id: 'cat_2', name: 'Styling & Perm', icon: 'hair-dryer' },
  { id: 'cat_3', name: 'Coloring', icon: 'palette' },
  { id: 'cat_4', name: 'Spa & Treatment', icon: 'spa' },
];

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 'srv_1',
    title: 'Executive Gentleman Haircut',
    description:
      'Precision haircut, scalp wash, shoulder massage, and professional styling product application.',
    durationMinutes: 45,
    price: 25,
    imageUrl:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400',
    categoryId: 'cat_1',
    categoryName: 'Haircut',
  },
  {
    id: 'srv_2',
    title: 'Beard Trim & Hot Towel Shave',
    description:
      'Classic razor shave with hot towel steam treatment and soothing aftershave balm.',
    durationMinutes: 30,
    price: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400',
    categoryId: 'cat_1',
    categoryName: 'Haircut',
  },
  {
    id: 'srv_3',
    title: 'Korean Texture Perm',
    description:
      'Modern wavy volume perm tailored for modern hairstyles. Long lasting for 3-4 months.',
    durationMinutes: 90,
    price: 65,
    imageUrl:
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400',
    categoryId: 'cat_2',
    categoryName: 'Styling & Perm',
  },
  {
    id: 'srv_4',
    title: 'Full Head Color & Toning',
    description:
      'Premium organic dye with customized highlights or full color treatment.',
    durationMinutes: 75,
    price: 55,
    imageUrl:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
    categoryId: 'cat_3',
    categoryName: 'Coloring',
  },
  {
    id: 'srv_5',
    title: 'Keratin Deep Repair Treatment',
    description:
      'Restores dry and damaged hair elasticity with keratin protein mask.',
    durationMinutes: 60,
    price: 45,
    imageUrl:
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400',
    categoryId: 'cat_4',
    categoryName: 'Spa & Treatment',
  },
];

export const MOCK_STYLISTS: Stylist[] = [
  {
    id: 'usr_stylist_1',
    fullName: 'David Miller',
    specialty: 'Master Barber',
    rating: 4.9,
    experienceYears: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    bio: 'Over 5 years of haircutting & styling experience. Award winner of Best Barber 2023.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400',
    ],
  },
  {
    id: 'usr_stylist_2',
    fullName: 'Sophia Martinez',
    specialty: 'Coloring & Perming',
    rating: 4.8,
    experienceYears: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    bio: 'Specialist in Korean wavy perms, balayage, and vibrant hair color transformations.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
    ],
  },
  {
    id: 'usr_stylist_3',
    fullName: 'Emma Clark',
    specialty: 'Hair & Styling',
    rating: 4.9,
    experienceYears: 6,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    bio: 'Creative hair designer specializing in classic haircuts, blow dry, and bridal styling.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400',
    ],
  },
  {
    id: 'usr_stylist_4',
    fullName: 'Olivia Brown',
    specialty: 'Scalp & Care',
    rating: 4.7,
    experienceYears: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    bio: 'Focuses on deep scalp nourishment, organic hair spa treatments, and damaged hair restoration.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=400',
    ],
  },
];
