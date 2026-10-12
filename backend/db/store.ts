import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'provider' | 'admin';
  avatar: string;
  city: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export interface IProviderProfile {
  _id: string;
  userId: string;
  businessName: string;
  category: string;
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  availabilityStatus: 'available' | 'busy' | 'offline';
  workingHours: string;
  serviceArea: string;
  city: string;
  services: {
    name: string;
    description: string;
    price: number;
    estimatedDuration: string;
  }[];
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  popular: boolean;
}

export interface IBooking {
  _id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  providerId: string;
  providerName?: string;
  providerPhone?: string;
  serviceId?: string;
  serviceName: string;
  category?: string;
  date: string;
  timeSlot: string;
  address: string;
  city: string;
  price: number;
  notes: string;
  status: 'pending' | 'confirmed' | 'on_the_way' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  cancellationReason?: string;
  createdAt: string;
  hasReviewed?: boolean;
}

export interface IReview {
  _id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IPayment {
  _id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  amount: number;
  method: 'card' | 'upi' | 'cash' | 'razorpay';
  transactionId: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface IComplaint {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  bookingId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminResponse: string;
  createdAt: string;
}

class DataStore {
  users: IUser[] = [];
  providerProfiles: IProviderProfile[] = [];
  categories: ICategory[] = [];
  bookings: IBooking[] = [];
  reviews: IReview[] = [];
  payments: IPayment[] = [];
  notifications: INotification[] = [];
  messages: IMessage[] = [];
  complaints: IComplaint[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    const defaultPassword = bcrypt.hashSync('password123', 10);
    const adminPassword = bcrypt.hashSync('admin123', 10);

    // Users
    this.users = [
      {
        _id: 'usr_admin_1',
        name: 'LocalServe Admin',
        email: 'admin@localserve.com',
        phone: '+91 98765 00000',
        passwordHash: adminPassword,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        city: 'Mumbai',
        address: 'LocalServe HQ, Nariman Point',
        isActive: true,
        createdAt: new Date('2026-01-01').toISOString()
      },
      {
        _id: 'usr_cust_1',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+91 98201 11223',
        passwordHash: defaultPassword,
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        city: 'Mumbai',
        address: 'B-402, Green View Apts, Andheri West',
        isActive: true,
        createdAt: new Date('2026-02-10').toISOString()
      },
      {
        _id: 'usr_cust_2',
        name: 'Arjun Mehta',
        email: 'arjun@example.com',
        phone: '+91 98199 44332',
        passwordHash: defaultPassword,
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        city: 'Mumbai',
        address: '12, Sunrise Enclave, Bandra West',
        isActive: true,
        createdAt: new Date('2026-02-15').toISOString()
      },
      {
        _id: 'usr_prov_1',
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        phone: '+91 98210 33445',
        passwordHash: defaultPassword,
        role: 'provider',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        city: 'Mumbai',
        address: 'Shop 4, Star Market, Santacruz',
        isActive: true,
        createdAt: new Date('2026-01-15').toISOString()
      },
      {
        _id: 'usr_prov_2',
        name: 'Anita Deshmukh',
        email: 'anita@example.com',
        phone: '+91 98334 55667',
        passwordHash: defaultPassword,
        role: 'provider',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        city: 'Mumbai',
        address: '14/B, Lotus Tower, Dadar',
        isActive: true,
        createdAt: new Date('2026-01-18').toISOString()
      },
      {
        _id: 'usr_prov_3',
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        phone: '+91 98670 77889',
        passwordHash: defaultPassword,
        role: 'provider',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        city: 'Mumbai',
        address: '88, Silver Arch, Powai',
        isActive: true,
        createdAt: new Date('2026-01-20').toISOString()
      },
      {
        _id: 'usr_prov_4',
        name: 'Sneha Kulkarni',
        email: 'sneha@example.com',
        phone: '+91 98920 99001',
        passwordHash: defaultPassword,
        role: 'provider',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        city: 'Mumbai',
        address: '501, Heritage Heights, Thane West',
        isActive: true,
        createdAt: new Date('2026-01-22').toISOString()
      },
      {
        _id: 'usr_prov_5',
        name: 'Amit Patel',
        email: 'amit@example.com',
        phone: '+91 98111 22334',
        passwordHash: defaultPassword,
        role: 'provider',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
        city: 'Mumbai',
        address: 'Tech Plaza, Lamington Road, Grant Road',
        isActive: true,
        createdAt: new Date('2026-01-25').toISOString()
      },
      {
        _id: 'usr_prov_6',
        name: 'Sunil Jadhav',
        email: 'sunil@example.com',
        phone: '+91 98222 33445',
        passwordHash: defaultPassword,
        role: 'provider',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        city: 'Mumbai',
        address: 'Garage No 2, Link Road, Borivali West',
        isActive: true,
        createdAt: new Date('2026-01-28').toISOString()
      }
    ];

    // Provider Profiles
    this.providerProfiles = [
      {
        _id: 'prof_1',
        userId: 'usr_prov_1',
        businessName: 'Verma Plumbing & Leak Solutions',
        category: 'Plumbing',
        bio: 'Certified master plumber with over 8 years of residential and commercial plumbing experience. Specializing in leak detection, fixture repairs, water heaters, and pipe line unclogging.',
        experienceYears: 8,
        hourlyRate: 399,
        rating: 4.9,
        reviewCount: 38,
        isVerified: true,
        availabilityStatus: 'available',
        workingHours: '8:00 AM - 8:00 PM (Mon-Sat)',
        serviceArea: 'Andheri, Juhu, Bandra, Santacruz',
        city: 'Mumbai',
        services: [
          { name: 'Emergency Leak Repair', description: 'Immediate diagnosis and fixing of leaking pipes, taps and drainage.', price: 499, estimatedDuration: '45 mins' },
          { name: 'Tap & Mixer Replacement', description: 'Complete installation or replacement of kitchen/bathroom faucets.', price: 349, estimatedDuration: '30 mins' },
          { name: 'Toilet & Flush Tank Repair', description: 'Repairing flush valves, cistern siphon, and seat fittings.', price: 599, estimatedDuration: '1 hour' },
          { name: 'Water Geyser Installation', description: 'Safe electrical and plumbing connections for water heaters.', price: 699, estimatedDuration: '1.5 hours' }
        ]
      },
      {
        _id: 'prof_2',
        userId: 'usr_prov_2',
        businessName: 'Deshmukh Electrical Works',
        category: 'Electrical',
        bio: 'Licensed electrical technician providing safe, compliant wiring, short-circuit troubleshooting, switchboard replacements, and smart home lighting.',
        experienceYears: 6,
        hourlyRate: 449,
        rating: 4.8,
        reviewCount: 29,
        isVerified: true,
        availabilityStatus: 'available',
        workingHours: '9:00 AM - 7:30 PM (All Days)',
        serviceArea: 'Dadar, Worli, Lower Parel, Prabhadevi',
        city: 'Mumbai',
        services: [
          { name: 'Short Circuit & MCB Tripping Fix', description: 'Diagnostic test of wiring loops and breaker replacement.', price: 549, estimatedDuration: '1 hour' },
          { name: 'Ceiling Fan Installation & Repair', description: 'Assembly, balancing, and wiring of ceiling fans.', price: 299, estimatedDuration: '30 mins' },
          { name: 'Switchboard / Modular Plate Upgrade', description: 'Replacing old switches with modular switches and sockets.', price: 449, estimatedDuration: '1 hour' },
          { name: 'Inverter Wiring & Setup', description: 'Battery inverter connection and dedicated line routing.', price: 899, estimatedDuration: '2 hours' }
        ]
      },
      {
        _id: 'prof_3',
        userId: 'usr_prov_3',
        businessName: 'SparklePro Deep Cleaners',
        category: 'Cleaning',
        bio: 'Hospital-grade sanitization and deep cleaning company. We bring industrial steam cleaners and eco-safe products for sparkling fresh homes and offices.',
        experienceYears: 5,
        hourlyRate: 599,
        rating: 4.9,
        reviewCount: 42,
        isVerified: true,
        availabilityStatus: 'available',
        workingHours: '7:30 AM - 6:00 PM (All Days)',
        serviceArea: 'Powai, Ghatkopar, Kanjurmarg, Vikhroli',
        city: 'Mumbai',
        services: [
          { name: 'Full Home Deep Cleaning (2 BHK)', description: 'Thorough sanitization of kitchen, bathrooms, bedrooms and balconies.', price: 2499, estimatedDuration: '4 hours' },
          { name: 'Kitchen Chimney & Degreasing', description: 'Deep degreasing of chimney filters, cooktop and backsplash tiles.', price: 899, estimatedDuration: '1.5 hours' },
          { name: 'Intense Bathroom Scrubbing & Descaling', description: 'Acid-free tile scrubbing, glass partition buffing and lime scale removal.', price: 699, estimatedDuration: '1 hour' },
          { name: 'Sofa & Mattress Shampooing', description: 'Wet vacuum extraction and fabric shampooing to eliminate mites.', price: 1199, estimatedDuration: '2 hours' }
        ]
      },
      {
        _id: 'prof_4',
        userId: 'usr_prov_4',
        businessName: 'Sneha’s Academic Coaching & Tutoring',
        category: 'Tutoring',
        bio: 'M.Sc in Mathematics with passion for conceptual clarity. Personalized one-on-one sessions in School Math, Science, and Olympiad prep.',
        experienceYears: 7,
        hourlyRate: 600,
        rating: 5.0,
        reviewCount: 22,
        isVerified: true,
        availabilityStatus: 'available',
        workingHours: '3:00 PM - 9:00 PM (Mon-Sat)',
        serviceArea: 'Thane, Mulund, Bhandup',
        city: 'Mumbai',
        services: [
          { name: 'CBSE / ICSE Math 1-on-1 Class', description: 'Individual syllabus coverage, doubts clearing and test papers.', price: 650, estimatedDuration: '1 hour' },
          { name: 'Physics & Chemistry Concept Booster', description: 'Numerical problem solving and intuitive science foundations.', price: 700, estimatedDuration: '1 hour' },
          { name: 'Exam Crash Course (10 Sessions)', description: 'Comprehensive board exam preparation package.', price: 5999, estimatedDuration: '10 hours' }
        ]
      },
      {
        _id: 'prof_5',
        userId: 'usr_prov_5',
        businessName: 'ChipLevel Computer & Laptop Care',
        category: 'Computer Repair',
        bio: 'Certified hardware and network engineer. On-site motherboard chip repairs, Windows/Mac OS reinstallations, SSD upgrades, and thermal paste repasting.',
        experienceYears: 9,
        hourlyRate: 499,
        rating: 4.7,
        reviewCount: 31,
        isVerified: true,
        availabilityStatus: 'available',
        workingHours: '10:00 AM - 9:00 PM (Mon-Sat)',
        serviceArea: 'South Mumbai, Grant Road, Dadar, Worli',
        city: 'Mumbai',
        services: [
          { name: 'Laptop Thermal Servicing & Dust Cleaning', description: 'Disassembly, copper heat pipe cleaning, and high-conductivity paste.', price: 599, estimatedDuration: '1 hour' },
          { name: 'OS Reinstall & Virus Removal', description: 'Fresh clean install of Windows 11 / macOS with drivers and backups.', price: 499, estimatedDuration: '1.5 hours' },
          { name: 'SSD Upgrade & RAM Expansion', description: 'Clone existing storage and install blazing-fast NVMe SSD.', price: 799, estimatedDuration: '1 hour' },
          { name: 'No Display / Motherboard Diagnostic', description: 'Testing capacitor shorts, power IC, and keyboard rail diagnostics.', price: 699, estimatedDuration: '2 hours' }
        ]
      },
      {
        _id: 'prof_6',
        userId: 'usr_prov_6',
        businessName: 'Speedy Wheels Auto Mechanic',
        category: 'Mechanic',
        bio: 'Experienced automotive technician for two-wheelers and passenger cars. Emergency jumpstarts, brake pad replacements, oil changes, and clutch tuning.',
        experienceYears: 10,
        hourlyRate: 499,
        rating: 4.8,
        reviewCount: 26,
        isVerified: false, // For testing admin verification flow!
        availabilityStatus: 'available',
        workingHours: '8:00 AM - 8:00 PM (All Days)',
        serviceArea: 'Borivali, Kandivali, Malad',
        city: 'Mumbai',
        services: [
          { name: 'Doorstep Two-Wheeler General Service', description: 'Oil change, chain tensioning, spark plug cleaning, and brake tuning.', price: 549, estimatedDuration: '1.5 hours' },
          { name: 'Car Battery Jumpstart & Diagnostic', description: 'On-spot battery jumpstart and alternator health verification.', price: 399, estimatedDuration: '30 mins' },
          { name: 'Brake Pad Replacement (Front/Rear)', description: 'Safe rotor inspection and disc brake pad replacement.', price: 799, estimatedDuration: '1 hour' }
        ]
      }
    ];

    // Service Categories
    this.categories = [
      { _id: 'cat_1', name: 'Plumbing', slug: 'plumbing', description: 'Leak repairs, pipe fittings, tap replacements, and drainage solutions.', icon: 'Wrench', popular: true },
      { _id: 'cat_2', name: 'Electrical', slug: 'electrical', description: 'Wiring, switches, breaker fixes, fans, and light installations.', icon: 'Zap', popular: true },
      { _id: 'cat_3', name: 'Cleaning', slug: 'cleaning', description: 'Full home deep cleaning, kitchen degreasing, bathroom scrubbing.', icon: 'Sparkles', popular: true },
      { _id: 'cat_4', name: 'Tutoring', slug: 'tutoring', description: 'Personalized 1-on-1 academic coaching, languages, and test preparation.', icon: 'BookOpen', popular: true },
      { _id: 'cat_5', name: 'Computer Repair', slug: 'computer-repair', description: 'Laptops, desktops, SSD upgrades, OS troubleshooting and chip repair.', icon: 'Laptop', popular: true },
      { _id: 'cat_6', name: 'Mechanic', slug: 'mechanic', description: 'Two-wheeler and four-wheeler repairs, jumpstarts, brakes, and servicing.', icon: 'Car', popular: true },
      { _id: 'cat_7', name: 'Carpentry', slug: 'carpentry', description: 'Furniture repairs, custom shelves, hinges, door latches and woodwork.', icon: 'Hammer', popular: false },
      { _id: 'cat_8', name: 'Painting', slug: 'painting', description: 'Interior and exterior wall painting, waterproof coatings, touchups.', icon: 'Paintbrush', popular: false },
      { _id: 'cat_9', name: 'Appliance Repair', slug: 'appliance-repair', description: 'Refrigerators, washing machines, microwaves, and AC maintenance.', icon: 'Tv', popular: false },
      { _id: 'cat_10', name: 'Gardening', slug: 'gardening', description: 'Balcony garden setup, plant trimming, organic soil fertilizing.', icon: 'Flower2', popular: false }
    ];

    // Seed Bookings
    this.bookings = [
      {
        _id: 'bk_101',
        customerId: 'usr_cust_1',
        customerName: 'Priya Sharma',
        customerPhone: '+91 98201 11223',
        providerId: 'usr_prov_1',
        providerName: 'Rahul Verma',
        providerPhone: '+91 98210 33445',
        serviceName: 'Emergency Leak Repair',
        category: 'Plumbing',
        date: '2026-10-15',
        timeSlot: '10:00 AM - 11:00 AM',
        address: 'B-402, Green View Apts, Andheri West',
        city: 'Mumbai',
        price: 499,
        notes: 'Kitchen sink pipe is leaking heavily under the cabinet.',
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'upi',
        createdAt: new Date('2026-10-10T14:30:00Z').toISOString(),
        hasReviewed: false
      },
      {
        _id: 'bk_102',
        customerId: 'usr_cust_1',
        customerName: 'Priya Sharma',
        customerPhone: '+91 98201 11223',
        providerId: 'usr_prov_3',
        providerName: 'Vikram Singh',
        providerPhone: '+91 98670 77889',
        serviceName: 'Full Home Deep Cleaning (2 BHK)',
        category: 'Cleaning',
        date: '2026-10-05',
        timeSlot: '09:00 AM - 01:00 PM',
        address: 'B-402, Green View Apts, Andheri West',
        city: 'Mumbai',
        price: 2499,
        notes: 'Pre-festive deep cleaning. Please pay special attention to bathroom tiles.',
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        createdAt: new Date('2026-10-03T11:00:00Z').toISOString(),
        hasReviewed: true
      },
      {
        _id: 'bk_103',
        customerId: 'usr_cust_2',
        customerName: 'Arjun Mehta',
        customerPhone: '+91 98199 44332',
        providerId: 'usr_prov_2',
        providerName: 'Anita Deshmukh',
        providerPhone: '+91 98334 55667',
        serviceName: 'Short Circuit & MCB Tripping Fix',
        category: 'Electrical',
        date: '2026-10-12',
        timeSlot: '02:00 PM - 03:00 PM',
        address: '12, Sunrise Enclave, Bandra West',
        city: 'Mumbai',
        price: 549,
        notes: 'Living room light circuits keep tripping the main breaker.',
        status: 'on_the_way',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        createdAt: new Date('2026-10-11T09:15:00Z').toISOString(),
        hasReviewed: false
      },
      {
        _id: 'bk_104',
        customerId: 'usr_cust_1',
        customerName: 'Priya Sharma',
        customerPhone: '+91 98201 11223',
        providerId: 'usr_prov_5',
        providerName: 'Amit Patel',
        providerPhone: '+91 98111 22334',
        serviceName: 'Laptop Thermal Servicing & Dust Cleaning',
        category: 'Computer Repair',
        date: '2026-10-18',
        timeSlot: '04:00 PM - 05:00 PM',
        address: 'B-402, Green View Apts, Andheri West',
        city: 'Mumbai',
        price: 599,
        notes: 'Dell XPS heats up significantly while editing video.',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'online',
        createdAt: new Date('2026-10-11T11:45:00Z').toISOString(),
        hasReviewed: false
      }
    ];

    // Seed Reviews
    this.reviews = [
      {
        _id: 'rev_1',
        bookingId: 'bk_102',
        customerId: 'usr_cust_1',
        customerName: 'Priya Sharma',
        providerId: 'usr_prov_3',
        rating: 5,
        comment: 'Outstanding service! Vikram and his team were polite, punctual and left the whole flat smelling fresh and sparkling.',
        createdAt: new Date('2026-10-05T15:00:00Z').toISOString()
      },
      {
        _id: 'rev_2',
        bookingId: 'bk_99',
        customerId: 'usr_cust_2',
        customerName: 'Arjun Mehta',
        providerId: 'usr_prov_1',
        rating: 5,
        comment: 'Rahul fixed our high-pressure mixer tap within 30 minutes without any mess. Highly recommended!',
        createdAt: new Date('2026-09-28T16:30:00Z').toISOString()
      },
      {
        _id: 'rev_3',
        bookingId: 'bk_98',
        customerId: 'usr_cust_1',
        customerName: 'Priya Sharma',
        providerId: 'usr_prov_2',
        rating: 4,
        comment: 'Anita solved a stubborn earthing issue in the master bedroom. Great attention to safety.',
        createdAt: new Date('2026-09-15T12:00:00Z').toISOString()
      }
    ];

    // Seed Payments
    this.payments = [
      {
        _id: 'pay_1',
        bookingId: 'bk_101',
        customerId: 'usr_cust_1',
        providerId: 'usr_prov_1',
        amount: 499,
        method: 'upi',
        transactionId: 'TXN_UPI_99381023',
        status: 'paid',
        createdAt: new Date('2026-10-10T14:32:00Z').toISOString()
      },
      {
        _id: 'pay_2',
        bookingId: 'bk_102',
        customerId: 'usr_cust_1',
        providerId: 'usr_prov_3',
        amount: 2499,
        method: 'card',
        transactionId: 'TXN_CARD_88291044',
        status: 'paid',
        createdAt: new Date('2026-10-05T14:10:00Z').toISOString()
      }
    ];

    // Seed Notifications
    this.notifications = [
      {
        _id: 'notif_1',
        userId: 'usr_cust_1',
        title: 'Booking Confirmed!',
        message: 'Rahul Verma has confirmed your Emergency Leak Repair for Oct 15 at 10:00 AM.',
        type: 'booking_confirmed',
        isRead: false,
        link: '/customer/bookings',
        createdAt: new Date('2026-10-10T14:35:00Z').toISOString()
      },
      {
        _id: 'notif_2',
        userId: 'usr_prov_1',
        title: 'New Booking Request',
        message: 'Priya Sharma booked Emergency Leak Repair for Oct 15.',
        type: 'new_booking',
        isRead: true,
        link: '/provider/bookings',
        createdAt: new Date('2026-10-10T14:30:00Z').toISOString()
      },
      {
        _id: 'notif_3',
        userId: 'usr_cust_2',
        title: 'Provider On The Way!',
        message: 'Anita Deshmukh is traveling to your Bandra West location.',
        type: 'provider_on_the_way',
        isRead: false,
        link: '/customer/bookings',
        createdAt: new Date('2026-10-11T13:45:00Z').toISOString()
      }
    ];

    // Seed Messages (Chat)
    this.messages = [
      {
        _id: 'msg_1',
        bookingId: 'bk_101',
        senderId: 'usr_cust_1',
        senderName: 'Priya Sharma',
        senderRole: 'customer',
        receiverId: 'usr_prov_1',
        text: 'Hi Rahul, will you be bringing spare PVC connectors or should I purchase some?',
        isRead: true,
        createdAt: new Date('2026-10-10T15:00:00Z').toISOString()
      },
      {
        _id: 'msg_2',
        bookingId: 'bk_101',
        senderId: 'usr_prov_1',
        senderName: 'Rahul Verma',
        senderRole: 'provider',
        receiverId: 'usr_cust_1',
        text: 'Hello Priya ji, no worries at all! My toolkit has all standard half-inch and three-quarter connectors.',
        isRead: true,
        createdAt: new Date('2026-10-10T15:04:00Z').toISOString()
      },
      {
        _id: 'msg_3',
        bookingId: 'bk_101',
        senderId: 'usr_cust_1',
        senderName: 'Priya Sharma',
        senderRole: 'customer',
        receiverId: 'usr_prov_1',
        text: 'Perfect, thank you! See you at 10 AM on the 15th.',
        isRead: false,
        createdAt: new Date('2026-10-10T15:06:00Z').toISOString()
      }
    ];

    // Seed Complaints
    this.complaints = [
      {
        _id: 'cmp_1',
        userId: 'usr_cust_2',
        userName: 'Arjun Mehta',
        userRole: 'customer',
        bookingId: 'bk_103',
        subject: 'Time rescheduling inquiry',
        description: 'Need to ensure provider arrives strictly after 2:30 PM due to residential society visitor gate rules.',
        status: 'resolved',
        adminResponse: 'We have notified provider Anita Deshmukh and scheduled arrival strictly for 2:40 PM.',
        createdAt: new Date('2026-10-11T10:00:00Z').toISOString()
      }
    ];
  }
}

export const dbStore = new DataStore();
