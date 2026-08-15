import { UserRole } from '../constants/roles';
import { UserProfile } from '../types/user';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr_customer_1',
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '0901234567',
    address: '123 Main St, District 1, HCMC',
    role: UserRole.CUSTOMER,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'usr_receptionist_1',
    fullName: 'Emily Clark',
    email: 'reception@salon.com',
    phone: '0907654321',
    address: 'Salon HQ, District 3, HCMC',
    role: UserRole.RECEPTIONIST,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'usr_stylist_1',
    fullName: 'David Miller',
    email: 'david@salon.com',
    phone: '0912345678',
    role: UserRole.STYLIST,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    specialty: 'Master Barber & Styling',
    experienceYears: 5,
    rating: 4.9,
    bio: 'Professional hair stylist with over 5 years of experience in modern haircuts, fades, and beard grooming.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=400',
    ],
  },
  {
    id: 'usr_stylist_2',
    fullName: 'Sophia Martinez',
    email: 'sophia@salon.com',
    phone: '0918765432',
    role: UserRole.STYLIST,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    specialty: 'Hair Coloring & Perming',
    experienceYears: 4,
    rating: 4.8,
    bio: 'Specialist in vibrant hair colors, balayage, perms, and hair treatment procedures.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
    ],
  },
];
