import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'owner', 'admin'], default: 'student' },
  phone: { type: String, trim: true },
  accountStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'suspended'], default: 'active' },
  warningCount: { type: Number, default: 0 },
  warnings: [{ reason: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  college: { type: String, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true },
  comment: { type: String, required: true, trim: true },
  isSample: { type: Boolean, default: false },
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  city: { type: String, required: true, trim: true },
  area: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  rent: { type: Number, required: true, min: 0 },
  size: { type: Number, required: true, min: 1 },
  deposit: { type: Number, default: 0, min: 0 },
  minimumStayMonths: { type: Number, default: 1, min: 1 },
  availableFrom: Date,
  furnishing: { type: String, enum: ['Furnished', 'Semi-furnished', 'Unfurnished'], default: 'Furnished' },
  bathroom: { type: String, enum: ['Private', 'Shared', 'Attached'], default: 'Shared' },
  roomType: { type: String, enum: ['Single room', 'Shared room', 'Studio', 'Apartment', 'PG'], default: 'PG' },
  features: [String],
  utilities: { water: { type: String, default: 'Included' }, electricity: { type: String, default: 'Included' }, other: { type: String, default: 'Not specified' } },
  images: [String],
  status: { type: String, enum: ['pending', 'available', 'booked', 'rejected', 'removed'], default: 'pending' },
  moderationNote: String,
  sampleKey: { type: String, unique: true, sparse: true },
  isSample: { type: Boolean, default: false },
  reviews: [reviewSchema],
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  college: { type: String, required: true },
  semester: { type: String, required: true },
  moveInDate: { type: Date, required: true },
  message: String,
  status: { type: String, enum: ['pending', 'shortlisted', 'accepted', 'declined', 'withdrawn'], default: 'pending' },
  warnings: [{ reason: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

const mediaSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contentType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp'] },
  data: { type: Buffer, required: true },
}, { timestamps: true });

applicationSchema.index({ room: 1, student: 1 }, { unique: true });

export const User = mongoose.model('User', userSchema);
export const Room = mongoose.model('Room', roomSchema);
export const Application = mongoose.model('Application', applicationSchema);
export const Media = mongoose.model('Media', mediaSchema);
