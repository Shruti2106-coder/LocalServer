import mongoose, { Schema } from 'mongoose';

// User Schema
export const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  city: { type: String, default: 'Mumbai' },
  address: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Provider Profile Schema
export const ProviderProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  category: { type: String, required: true },
  bio: { type: String, default: '' },
  experienceYears: { type: Number, default: 3 },
  hourlyRate: { type: Number, default: 499 },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  availabilityStatus: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  workingHours: { type: String, default: '9:00 AM - 7:00 PM' },
  serviceArea: { type: String, default: 'Within 15 km' },
  city: { type: String, default: 'Mumbai' },
  createdAt: { type: Date, default: Date.now }
});

// Service Category Schema
export const ServiceCategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Wrench' },
  popular: { type: Boolean, default: false }
});

// Service Schema
export const ServiceSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  estimatedDuration: { type: String, default: '1 hour' },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Booking Schema
export const BookingSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  serviceName: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, default: 'Mumbai' },
  price: { type: Number, required: true },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: { type: String, default: 'online' },
  cancellationReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Review Schema
export const ReviewSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Payment Schema
export const PaymentSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['card', 'upi', 'cash', 'razorpay'], default: 'upi' },
  transactionId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'paid' },
  createdAt: { type: Date, default: Date.now }
});

// Notification Schema
export const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  isRead: { type: Boolean, default: false },
  link: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Message Schema
export const MessageSchema = new Schema({
  bookingId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: String, required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Complaint Schema
export const ComplaintSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  bookingId: { type: String, default: '' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  adminResponse: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Mongoose Models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const ProviderProfile = mongoose.models.ProviderProfile || mongoose.model('ProviderProfile', ProviderProfileSchema);
export const ServiceCategory = mongoose.models.ServiceCategory || mongoose.model('ServiceCategory', ServiceCategorySchema);
export const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
