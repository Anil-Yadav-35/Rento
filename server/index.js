// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { randomBytes } from 'node:crypto';
// import { Application, Media, Room, User } from './models.js';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';

// const app = express();
// const port = process.env.PORT || 4000;
// const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());
// app.use(cors({ origin: (origin, callback) => {
//   const localDevOrigin = process.env.NODE_ENV !== 'production' && /^http:\/\/[^:]+:5173$/.test(origin || '');
//   callback(null, !origin || allowedOrigins.includes(origin) || localDevOrigin);
// } }));
// app.use(express.json({ limit: '12mb' }));

// const __dirname = path.dirname(
//   fileURLToPath(import.meta.url)
// );

// // Serve the React frontend
// app.use(express.static(distPath));

// // Send the frontend for website routes
// app.get('/{*path}', (req, res, next) => {
//   if (req.path.startsWith('/api/')) {
//     return next();
//   }

//   res.sendFile(path.join(distPath, 'index.html'));
// });
// const distPath = path.resolve(__dirname, '../dist');

// const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, accountStatus: user.accountStatus, warnings: user.warnings || [] });
// const auth = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
//     if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
//     req.user = await User.findById(jwt.verify(token, process.env.JWT_SECRET).sub);
//     if (!req.user || req.user.accountStatus === 'suspended') return res.status(401).json({ message: 'This account is unavailable.' });
//     next();
//   } catch { res.status(401).json({ message: 'Your session expired. Please sign in again.' }); }
// };
// const allow = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have permission to do that.' });
// const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

// app.get('/api/health', (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

// app.post('/api/uploads/images', auth, allow('owner'), wrap(async (req, res) => {
//   if (req.user.accountStatus !== 'approved') return res.status(403).json({ message: 'Your owner account must be approved before uploading listing photos.' });
//   const { images } = req.body;
//   if (!Array.isArray(images) || images.length < 1 || images.length > 8) return res.status(400).json({ message: 'Upload between 1 and 8 room photos at a time.' });
//   const records = [];
//   for (const image of images) {
//     if (!['image/jpeg', 'image/png', 'image/webp'].includes(image?.contentType) || typeof image.data !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)) return res.status(400).json({ message: 'Use valid JPEG, PNG or WebP image files.' });
//     const data = Buffer.from(image.data, 'base64');
//     const validSignature = image.contentType === 'image/jpeg' ? data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
//       : image.contentType === 'image/png' ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
//         : data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP';
//     if (!data.length || data.length > 1024 * 1024 || !validSignature) return res.status(400).json({ message: 'Each photo must be a valid image no larger than 1 MB after compression.' });
//     records.push({ owner: req.user.id, contentType: image.contentType, data });
//   }
//   const saved = await Media.insertMany(records);
//   res.status(201).json({ images: saved.map((item) => `/api/media/${item.id}`) });
// }));
// app.get('/api/media/:id', wrap(async (req, res) => {
//   if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
//   const media = await Media.findById(req.params.id).select('contentType data');
//   if (!media) return res.status(404).end();
//   res.type(media.contentType).set('Cache-Control', 'public, max-age=31536000, immutable').set('X-Content-Type-Options', 'nosniff').send(media.data);
// }));

// app.post('/api/auth/register', wrap(async (req, res) => {
//   const { name, email, password, role = 'student', phone } = req.body;
//   if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required.' });
//   if (!['student', 'owner'].includes(role)) return res.status(400).json({ message: 'Choose student or owner account.' });
//   if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' });
//   const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role, phone, accountStatus: role === 'owner' ? 'pending' : 'active' });
//   const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//   res.status(201).json({ token, user: safeUser(user) });
// }));

// app.post('/api/auth/login', wrap(async (req, res) => {
//   const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+password');
//   if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
//   if (user.accountStatus === 'rejected' || user.accountStatus === 'suspended') return res.status(403).json({ message: 'This account is not active. Contact Rento support.' });
//   const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//   res.json({ token, user: safeUser(user) });
// }));
// app.get('/api/auth/me', auth, (req, res) => res.json({ user: safeUser(req.user) }));
// app.patch('/api/auth/profile', auth, wrap(async (req, res) => {
//   const { name, phone } = req.body;
//   if (!name?.trim()) return res.status(400).json({ message: 'Your name is required.' });
//   const user = await User.findByIdAndUpdate(req.user.id, { name: name.trim(), phone: phone?.trim() }, { new: true, runValidators: true });
//   res.json({ user: safeUser(user) });
// }));
// app.patch('/api/auth/password', auth, wrap(async (req, res) => {
//   const { currentPassword, newPassword } = req.body;
//   const user = await User.findById(req.user.id).select('+password');
//   if (!await bcrypt.compare(currentPassword || '', user.password)) return res.status(400).json({ message: 'Your current password is incorrect.' });
//   if (!newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Choose a password with at least 8 characters.' });
//   user.password = await bcrypt.hash(newPassword, 12);
//   await user.save();
//   res.json({ message: 'Password updated.' });
// }));

// app.get('/api/rooms', wrap(async (req, res) => {
//   const query = { status: 'available' };
//   if (req.query.q) query.$or = ['title', 'city', 'area', 'roomType'].map((key) => ({ [key]: { $regex: req.query.q, $options: 'i' } }));
//   if (req.query.maxRent) query.rent = { $lte: Number(req.query.maxRent) };
//   if (req.query.city) query.city = { $regex: req.query.city, $options: 'i' };
//   res.json(await Room.find(query).populate('owner', 'name').sort({ createdAt: -1 }));
// }));
// app.get('/api/rooms/:id', wrap(async (req, res) => {
//   const room = await Room.findOne({ _id: req.params.id, status: 'available' }).populate('owner', 'name');
//   if (!room) return res.status(404).json({ message: 'Room not found.' });
//   res.json(room);
// }));
// app.post('/api/rooms/:id/reviews', auth, allow('student'), wrap(async (req, res) => {
//   const { rating, title, comment, college } = req.body;
//   if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !title?.trim() || !comment?.trim()) {
//     return res.status(400).json({ message: 'Add a title, a comment, and a rating from 1 to 5.' });
//   }
//   const room = await Room.findOne({ _id: req.params.id, status: 'available' });
//   if (!room) return res.status(404).json({ message: 'Room not found.' });
//   const acceptedApplication = await Application.exists({ room: room._id, student: req.user.id, status: 'accepted' });
//   if (!acceptedApplication) return res.status(403).json({ message: 'Only students with an accepted application can review this room.' });
//   if (room.reviews.some((review) => String(review.reviewer) === String(req.user.id))) return res.status(409).json({ message: 'You have already reviewed this room.' });
//   room.reviews.push({ reviewer: req.user.id, name: req.user.name, college, rating: Number(rating), title, comment });
//   await room.save();
//   res.status(201).json(room.reviews.at(-1));
// }));
// app.post('/api/rooms', auth, allow('owner'), wrap(async (req, res) => {
//   if (req.user.accountStatus !== 'approved') return res.status(403).json({ message: 'Your owner account must be approved before you can post rooms.' });
//   res.status(201).json(await Room.create({ ...req.body, owner: req.user.id, status: 'pending' }));
// }));
// app.get('/api/owner/rooms', auth, allow('owner'), wrap(async (req, res) => res.json(await Room.find({ owner: req.user.id }).sort({ createdAt: -1 }))));
// app.patch('/api/owner/rooms/:id/status', auth, allow('owner'), wrap(async (req, res) => {
//   const { status } = req.body;
//   if (!['available', 'booked'].includes(status)) return res.status(400).json({ message: 'Choose available or booked.' });
//   const room = await Room.findOneAndUpdate({ _id: req.params.id, owner: req.user.id, status: { $in: ['available', 'booked'] } }, { status }, { new: true });
//   if (!room) return res.status(404).json({ message: 'Room not found or awaiting moderation.' });
//   res.json(room);
// }));
// app.patch('/api/owner/rooms/:id', auth, allow('owner'), wrap(async (req, res) => {
//   const allowed = ['title', 'description', 'city', 'area', 'address', 'rent', 'size', 'deposit', 'minimumStayMonths', 'availableFrom', 'furnishing', 'bathroom', 'roomType', 'features', 'utilities', 'images'];
//   const changes = Object.fromEntries(allowed.filter((key) => key in req.body).map((key) => [key, req.body[key]]));
//   const room = await Room.findOneAndUpdate({ _id: req.params.id, owner: req.user.id, status: { $in: ['available', 'booked', 'pending', 'rejected'] } }, { ...changes, status: 'pending' }, { new: true, runValidators: true });
//   if (!room) return res.status(404).json({ message: 'Room not found.' });
//   res.json(room);
// }));

// app.post('/api/applications', auth, allow('student'), wrap(async (req, res) => {
//   const room = await Room.findOne({ _id: req.body.roomId, status: 'available' });
//   if (!room) return res.status(404).json({ message: 'This room is no longer available.' });
//   const details = { owner: room.owner, fullName: req.body.fullName, phone: req.body.phone, email: req.body.email, college: req.body.college, semester: req.body.semester, moveInDate: req.body.moveInDate, message: req.body.message };
//   const existing = await Application.findOne({ room: room.id, student: req.user.id });
//   if (existing) {
//     if (existing.status !== 'withdrawn') return res.status(409).json({ message: 'You already have an application for this room.' });
//     Object.assign(existing, details, { status: 'pending' });
//     await existing.save();
//     return res.json(existing);
//   }
//   res.status(201).json(await Application.create({ ...details, room: room.id, student: req.user.id }));
// }));
// app.get('/api/applications/mine', auth, allow('student'), wrap(async (req, res) => res.json(await Application.find({ student: req.user.id }).populate('room', 'title city area rent').sort({ createdAt: -1 }))));
// app.patch('/api/applications/mine/:id/withdraw', auth, allow('student'), wrap(async (req, res) => {
//   const application = await Application.findOneAndUpdate({ _id: req.params.id, student: req.user.id, status: { $in: ['pending', 'shortlisted'] } }, { status: 'withdrawn' }, { new: true });
//   if (!application) return res.status(404).json({ message: 'This application can no longer be withdrawn.' });
//   res.json(application);
// }));
// app.get('/api/owner/applications', auth, allow('owner'), wrap(async (req, res) => res.json(await Application.find({ owner: req.user.id }).populate('room', 'title city area rent').populate('student', 'name email phone warnings').sort({ createdAt: -1 }))));
// app.patch('/api/owner/applications/:id/status', auth, allow('owner'), wrap(async (req, res) => {
//   if (!['shortlisted', 'accepted', 'declined'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid application status.' });
//   const application = await Application.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { status: req.body.status }, { new: true });
//   if (!application) return res.status(404).json({ message: 'Application not found.' });
//   res.json(application);
// }));

// app.get('/api/admin/overview', auth, allow('admin'), wrap(async (_req, res) => {
//   const [owners, pendingOwners, rooms, pendingRooms, availableRooms, bookedRooms, applications, pendingApplications, students] = await Promise.all([
//     User.countDocuments({ role: 'owner' }), User.countDocuments({ role: 'owner', accountStatus: 'pending' }), Room.countDocuments(),
//     Room.countDocuments({ status: 'pending' }), Room.countDocuments({ status: 'available' }), Room.countDocuments({ status: 'booked' }),
//     Application.countDocuments(), Application.countDocuments({ status: 'pending' }), User.countDocuments({ role: 'student' }),
//   ]);
//   res.json({ owners, pendingOwners, rooms, pendingRooms, availableRooms, bookedRooms, applications, pendingApplications, students });
// }));
// app.get('/api/admin/owners', auth, allow('admin'), wrap(async (_req, res) => res.json(await User.find({ role: 'owner' }).sort({ createdAt: -1 }))));
// app.get('/api/admin/users', auth, allow('admin'), wrap(async (_req, res) => res.json(await User.find({ role: { $in: ['owner', 'student'] } }).sort({ createdAt: -1 }))));
// app.post('/api/admin/owners', auth, allow('admin'), wrap(async (req, res) => {
//   const { name, email, phone, accountStatus = 'approved' } = req.body;
//   if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: 'Name and email are required.' });
//   if (!['approved', 'pending'].includes(accountStatus)) return res.status(400).json({ message: 'Choose approved or pending for the new owner.' });
//   const normalizedEmail = email.trim().toLowerCase();
//   if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
//   const temporaryPassword = randomBytes(15).toString('base64url');
//   const owner = await User.create({ name: name.trim(), email: normalizedEmail, phone: phone?.trim(), role: 'owner', accountStatus, password: await bcrypt.hash(temporaryPassword, 12) });
//   res.status(201).json({ owner: safeUser(owner), temporaryPassword });
// }));
// app.patch('/api/admin/users/:id', auth, allow('admin'), wrap(async (req, res) => {
//   const user = await User.findOne({ _id: req.params.id, role: { $in: ['student', 'owner'] } });
//   if (!user) return res.status(404).json({ message: 'Account not found.' });
//   const allowedStatuses = user.role === 'owner' ? ['pending', 'approved', 'rejected', 'suspended'] : ['active', 'rejected', 'suspended'];
//   const { accountStatus, warning } = req.body;
//   if (accountStatus && !allowedStatuses.includes(accountStatus)) return res.status(400).json({ message: 'Invalid account status for this role.' });
//   if (accountStatus) user.accountStatus = accountStatus;
//   if (warning?.trim()) { user.warningCount += 1; user.warnings.push({ reason: warning.trim() }); }
//   await user.save();
//   res.json(safeUser(user));
// }));
// app.post('/api/admin/users/:id/reset-password', auth, allow('admin'), wrap(async (req, res) => {
//   const user = await User.findOne({ _id: req.params.id, role: { $in: ['student', 'owner'] } });
//   if (!user) return res.status(404).json({ message: 'Account not found.' });
//   const temporaryPassword = randomBytes(15).toString('base64url');
//   user.password = await bcrypt.hash(temporaryPassword, 12);
//   await user.save();
//   res.json({ email: user.email, temporaryPassword });
// }));
// app.patch('/api/admin/owners/:id', auth, allow('admin'), wrap(async (req, res) => {
//   const { accountStatus, warning } = req.body;
//   if (accountStatus && !['approved', 'rejected', 'suspended', 'pending'].includes(accountStatus)) return res.status(400).json({ message: 'Invalid owner status.' });
//   const update = {};
//   if (accountStatus) update.accountStatus = accountStatus;
//   if (warning?.trim()) { update.$inc = { warningCount: 1 }; update.$push = { warnings: { reason: warning.trim() } }; }
//   const owner = await User.findOneAndUpdate({ _id: req.params.id, role: 'owner' }, update, { new: true });
//   if (!owner) return res.status(404).json({ message: 'Owner not found.' });
//   res.json(safeUser(owner));
// }));
// app.get('/api/admin/rooms', auth, allow('admin'), wrap(async (_req, res) => res.json(await Room.find().populate('owner', 'name email').sort({ createdAt: -1 }))));
// app.patch('/api/admin/rooms/:id', auth, allow('admin'), wrap(async (req, res) => {
//   const { status, moderationNote } = req.body;
//   if (!['available', 'rejected', 'removed', 'booked', 'pending'].includes(status)) return res.status(400).json({ message: 'Invalid listing status.' });
//   const room = await Room.findByIdAndUpdate(req.params.id, { status, moderationNote }, { new: true }).populate('owner', 'name email');
//   if (!room) return res.status(404).json({ message: 'Room not found.' });
//   res.json(room);
// }));
// app.get('/api/admin/applications', auth, allow('admin'), wrap(async (_req, res) => res.json(await Application.find().populate('room', 'title city area rent').populate('student', 'name email phone warnings').populate('owner', 'name email').sort({ createdAt: -1 }))));
// app.patch('/api/admin/applications/:id/status', auth, allow('admin'), wrap(async (req, res) => {
//   const { status } = req.body;
//   if (!['pending', 'shortlisted', 'accepted', 'declined', 'withdrawn'].includes(status)) return res.status(400).json({ message: 'Invalid application status.' });
//   const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('room', 'title city area rent').populate('student', 'name email').populate('owner', 'name email');
//   if (!application) return res.status(404).json({ message: 'Application not found.' });
//   res.json(application);
// }));
// app.post('/api/admin/applications/:id/warn', auth, allow('admin'), wrap(async (req, res) => {
//   const reason = req.body.reason?.trim();
//   if (!reason) return res.status(400).json({ message: 'Enter a reason for the warning.' });
//   const application = await Application.findByIdAndUpdate(req.params.id, { $push: { warnings: { reason } } }, { new: true });
//   if (!application) return res.status(404).json({ message: 'Application not found.' });
//   await User.findByIdAndUpdate(application.student, { $inc: { warningCount: 1 }, $push: { warnings: { reason } } });
//   res.json(application);
// }));

// app.use((err, _req, res, _next) => {
//   if (err.code === 11000) return res.status(409).json({ message: 'This request already exists.' });
//   if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ message: err.message });
//   console.error(err);
//   res.status(500).json({ message: 'Something went wrong. Please try again.' });
// });

// if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
//   console.error('Set MONGODB_URI and JWT_SECRET in .env before starting the API.');
//   process.exit(1);
// }
// mongoose.connect(process.env.MONGODB_URI)
//   .then(async () => {
//     if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && !(await User.exists({ role: 'admin' }))) {
//       await User.create({ name: process.env.ADMIN_NAME || 'Rento Admin', email: process.env.ADMIN_EMAIL, password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin', accountStatus: 'active' });
//       console.log('Initial admin account created. Remove ADMIN_PASSWORD from the environment after first startup.');
//     }
//     app.listen(port, () => console.log(`Rento API listening on http://localhost:${port}`));
//   })
//   .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });




import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { Application, Media, Room, User } from './models.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.use(cors({ origin: (origin, callback) => {
  const localDevOrigin = process.env.NODE_ENV !== 'production' && /^http:\/\/[^:]+:5173$/.test(origin || '');
  callback(null, !origin || allowedOrigins.includes(origin) || localDevOrigin);
} }));
app.use(express.json({ limit: '12mb' }));

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);
const distPath = path.resolve(__dirname, '../dist');

// Serve the React frontend
app.use(express.static(distPath));

// Send the frontend for website routes
app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(distPath, 'index.html'));
});

const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, accountStatus: user.accountStatus, warnings: user.warnings || [] });
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    req.user = await User.findById(jwt.verify(token, process.env.JWT_SECRET).sub);
    if (!req.user || req.user.accountStatus === 'suspended') return res.status(401).json({ message: 'This account is unavailable.' });
    next();
  } catch { res.status(401).json({ message: 'Your session expired. Please sign in again.' }); }
};
const allow = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have permission to do that.' });
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

app.get('/api/health', (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.post('/api/uploads/images', auth, allow('owner'), wrap(async (req, res) => {
  if (req.user.accountStatus !== 'approved') return res.status(403).json({ message: 'Your owner account must be approved before uploading listing photos.' });
  const { images } = req.body;
  if (!Array.isArray(images) || images.length < 1 || images.length > 8) return res.status(400).json({ message: 'Upload between 1 and 8 room photos at a time.' });
  const records = [];
  for (const image of images) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image?.contentType) || typeof image.data !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)) return res.status(400).json({ message: 'Use valid JPEG, PNG or WebP image files.' });
    const data = Buffer.from(image.data, 'base64');
    const validSignature = image.contentType === 'image/jpeg' ? data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
      : image.contentType === 'image/png' ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP';
    if (!data.length || data.length > 1024 * 1024 || !validSignature) return res.status(400).json({ message: 'Each photo must be a valid image no larger than 1 MB after compression.' });
    records.push({ owner: req.user.id, contentType: image.contentType, data });
  }
  const saved = await Media.insertMany(records);
  res.status(201).json({ images: saved.map((item) => `/api/media/${item.id}`) });
}));
app.get('/api/media/:id', wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
  const media = await Media.findById(req.params.id).select('contentType data');
  if (!media) return res.status(404).end();
  res.type(media.contentType).set('Cache-Control', 'public, max-age=31536000, immutable').set('X-Content-Type-Options', 'nosniff').send(media.data);
}));

app.post('/api/auth/register', wrap(async (req, res) => {
  const { name, email, password, role = 'student', phone } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required.' });
  if (!['student', 'owner'].includes(role)) return res.status(400).json({ message: 'Choose student or owner account.' });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role, phone, accountStatus: role === 'owner' ? 'pending' : 'active' });
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: safeUser(user) });
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  if (user.accountStatus === 'rejected' || user.accountStatus === 'suspended') return res.status(403).json({ message: 'This account is not active. Contact Rento support.' });
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: safeUser(user) });
}));
app.get('/api/auth/me', auth, (req, res) => res.json({ user: safeUser(req.user) }));
app.patch('/api/auth/profile', auth, wrap(async (req, res) => {
  const { name, phone } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Your name is required.' });
  const user = await User.findByIdAndUpdate(req.user.id, { name: name.trim(), phone: phone?.trim() }, { new: true, runValidators: true });
  res.json({ user: safeUser(user) });
}));
app.patch('/api/auth/password', auth, wrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!await bcrypt.compare(currentPassword || '', user.password)) return res.status(400).json({ message: 'Your current password is incorrect.' });
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Choose a password with at least 8 characters.' });
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: 'Password updated.' });
}));

app.get('/api/rooms', wrap(async (req, res) => {
  const query = { status: 'available' };
  if (req.query.q) query.$or = ['title', 'city', 'area', 'roomType'].map((key) => ({ [key]: { $regex: req.query.q, $options: 'i' } }));
  if (req.query.maxRent) query.rent = { $lte: Number(req.query.maxRent) };
  if (req.query.city) query.city = { $regex: req.query.city, $options: 'i' };
  res.json(await Room.find(query).populate('owner', 'name').sort({ createdAt: -1 }));
}));
app.get('/api/rooms/:id', wrap(async (req, res) => {
  const room = await Room.findOne({ _id: req.params.id, status: 'available' }).populate('owner', 'name');
  if (!room) return res.status(404).json({ message: 'Room not found.' });
  res.json(room);
}));
app.post('/api/rooms/:id/reviews', auth, allow('student'), wrap(async (req, res) => {
  const { rating, title, comment, college } = req.body;
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !title?.trim() || !comment?.trim()) {
    return res.status(400).json({ message: 'Add a title, a comment, and a rating from 1 to 5.' });
  }
  const room = await Room.findOne({ _id: req.params.id, status: 'available' });
  if (!room) return res.status(404).json({ message: 'Room not found.' });
  const acceptedApplication = await Application.exists({ room: room._id, student: req.user.id, status: 'accepted' });
  if (!acceptedApplication) return res.status(403).json({ message: 'Only students with an accepted application can review this room.' });
  if (room.reviews.some((review) => String(review.reviewer) === String(req.user.id))) return res.status(409).json({ message: 'You have already reviewed this room.' });
  room.reviews.push({ reviewer: req.user.id, name: req.user.name, college, rating: Number(rating), title, comment });
  await room.save();
  res.status(201).json(room.reviews.at(-1));
}));
app.post('/api/rooms', auth, allow('owner'), wrap(async (req, res) => {
  if (req.user.accountStatus !== 'approved') return res.status(403).json({ message: 'Your owner account must be approved before you can post rooms.' });
  res.status(201).json(await Room.create({ ...req.body, owner: req.user.id, status: 'pending' }));
}));
app.get('/api/owner/rooms', auth, allow('owner'), wrap(async (req, res) => res.json(await Room.find({ owner: req.user.id }).sort({ createdAt: -1 }))));
app.patch('/api/owner/rooms/:id/status', auth, allow('owner'), wrap(async (req, res) => {
  const { status } = req.body;
  if (!['available', 'booked'].includes(status)) return res.status(400).json({ message: 'Choose available or booked.' });
  const room = await Room.findOneAndUpdate({ _id: req.params.id, owner: req.user.id, status: { $in: ['available', 'booked'] } }, { status }, { new: true });
  if (!room) return res.status(404).json({ message: 'Room not found or awaiting moderation.' });
  res.json(room);
}));
app.patch('/api/owner/rooms/:id', auth, allow('owner'), wrap(async (req, res) => {
  const allowed = ['title', 'description', 'city', 'area', 'address', 'rent', 'size', 'deposit', 'minimumStayMonths', 'availableFrom', 'furnishing', 'bathroom', 'roomType', 'features', 'utilities', 'images'];
  const changes = Object.fromEntries(allowed.filter((key) => key in req.body).map((key) => [key, req.body[key]]));
  const room = await Room.findOneAndUpdate({ _id: req.params.id, owner: req.user.id, status: { $in: ['available', 'booked', 'pending', 'rejected'] } }, { ...changes, status: 'pending' }, { new: true, runValidators: true });
  if (!room) return res.status(404).json({ message: 'Room not found.' });
  res.json(room);
}));

app.post('/api/applications', auth, allow('student'), wrap(async (req, res) => {
  const room = await Room.findOne({ _id: req.body.roomId, status: 'available' });
  if (!room) return res.status(404).json({ message: 'This room is no longer available.' });
  const details = { owner: room.owner, fullName: req.body.fullName, phone: req.body.phone, email: req.body.email, college: req.body.college, semester: req.body.semester, moveInDate: req.body.moveInDate, message: req.body.message };
  const existing = await Application.findOne({ room: room.id, student: req.user.id });
  if (existing) {
    if (existing.status !== 'withdrawn') return res.status(409).json({ message: 'You already have an application for this room.' });
    Object.assign(existing, details, { status: 'pending' });
    await existing.save();
    return res.json(existing);
  }
  res.status(201).json(await Application.create({ ...details, room: room.id, student: req.user.id }));
}));
app.get('/api/applications/mine', auth, allow('student'), wrap(async (req, res) => res.json(await Application.find({ student: req.user.id }).populate('room', 'title city area rent').sort({ createdAt: -1 }))));
app.patch('/api/applications/mine/:id/withdraw', auth, allow('student'), wrap(async (req, res) => {
  const application = await Application.findOneAndUpdate({ _id: req.params.id, student: req.user.id, status: { $in: ['pending', 'shortlisted'] } }, { status: 'withdrawn' }, { new: true });
  if (!application) return res.status(404).json({ message: 'This application can no longer be withdrawn.' });
  res.json(application);
}));
app.get('/api/owner/applications', auth, allow('owner'), wrap(async (req, res) => res.json(await Application.find({ owner: req.user.id }).populate('room', 'title city area rent').populate('student', 'name email phone warnings').sort({ createdAt: -1 }))));
app.patch('/api/owner/applications/:id/status', auth, allow('owner'), wrap(async (req, res) => {
  if (!['shortlisted', 'accepted', 'declined'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid application status.' });
  const application = await Application.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { status: req.body.status }, { new: true });
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  res.json(application);
}));

app.get('/api/admin/overview', auth, allow('admin'), wrap(async (_req, res) => {
  const [owners, pendingOwners, rooms, pendingRooms, availableRooms, bookedRooms, applications, pendingApplications, students] = await Promise.all([
    User.countDocuments({ role: 'owner' }), User.countDocuments({ role: 'owner', accountStatus: 'pending' }), Room.countDocuments(),
    Room.countDocuments({ status: 'pending' }), Room.countDocuments({ status: 'available' }), Room.countDocuments({ status: 'booked' }),
    Application.countDocuments(), Application.countDocuments({ status: 'pending' }), User.countDocuments({ role: 'student' }),
  ]);
  res.json({ owners, pendingOwners, rooms, pendingRooms, availableRooms, bookedRooms, applications, pendingApplications, students });
}));
app.get('/api/admin/owners', auth, allow('admin'), wrap(async (_req, res) => res.json(await User.find({ role: 'owner' }).sort({ createdAt: -1 }))));
app.get('/api/admin/users', auth, allow('admin'), wrap(async (_req, res) => res.json(await User.find({ role: { $in: ['owner', 'student'] } }).sort({ createdAt: -1 }))));
app.post('/api/admin/owners', auth, allow('admin'), wrap(async (req, res) => {
  const { name, email, phone, accountStatus = 'approved' } = req.body;
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: 'Name and email are required.' });
  if (!['approved', 'pending'].includes(accountStatus)) return res.status(400).json({ message: 'Choose approved or pending for the new owner.' });
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const temporaryPassword = randomBytes(15).toString('base64url');
  const owner = await User.create({ name: name.trim(), email: normalizedEmail, phone: phone?.trim(), role: 'owner', accountStatus, password: await bcrypt.hash(temporaryPassword, 12) });
  res.status(201).json({ owner: safeUser(owner), temporaryPassword });
}));
app.patch('/api/admin/users/:id', auth, allow('admin'), wrap(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: { $in: ['student', 'owner'] } });
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  const allowedStatuses = user.role === 'owner' ? ['pending', 'approved', 'rejected', 'suspended'] : ['active', 'rejected', 'suspended'];
  const { accountStatus, warning } = req.body;
  if (accountStatus && !allowedStatuses.includes(accountStatus)) return res.status(400).json({ message: 'Invalid account status for this role.' });
  if (accountStatus) user.accountStatus = accountStatus;
  if (warning?.trim()) { user.warningCount += 1; user.warnings.push({ reason: warning.trim() }); }
  await user.save();
  res.json(safeUser(user));
}));
app.post('/api/admin/users/:id/reset-password', auth, allow('admin'), wrap(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: { $in: ['student', 'owner'] } });
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  const temporaryPassword = randomBytes(15).toString('base64url');
  user.password = await bcrypt.hash(temporaryPassword, 12);
  await user.save();
  res.json({ email: user.email, temporaryPassword });
}));
app.patch('/api/admin/owners/:id', auth, allow('admin'), wrap(async (req, res) => {
  const { accountStatus, warning } = req.body;
  if (accountStatus && !['approved', 'rejected', 'suspended', 'pending'].includes(accountStatus)) return res.status(400).json({ message: 'Invalid owner status.' });
  const update = {};
  if (accountStatus) update.accountStatus = accountStatus;
  if (warning?.trim()) { update.$inc = { warningCount: 1 }; update.$push = { warnings: { reason: warning.trim() } }; }
  const owner = await User.findOneAndUpdate({ _id: req.params.id, role: 'owner' }, update, { new: true });
  if (!owner) return res.status(404).json({ message: 'Owner not found.' });
  res.json(safeUser(owner));
}));
app.get('/api/admin/rooms', auth, allow('admin'), wrap(async (_req, res) => res.json(await Room.find().populate('owner', 'name email').sort({ createdAt: -1 }))));
app.patch('/api/admin/rooms/:id', auth, allow('admin'), wrap(async (req, res) => {
  const { status, moderationNote } = req.body;
  if (!['available', 'rejected', 'removed', 'booked', 'pending'].includes(status)) return res.status(400).json({ message: 'Invalid listing status.' });
  const room = await Room.findByIdAndUpdate(req.params.id, { status, moderationNote }, { new: true }).populate('owner', 'name email');
  if (!room) return res.status(404).json({ message: 'Room not found.' });
  res.json(room);
}));
app.get('/api/admin/applications', auth, allow('admin'), wrap(async (_req, res) => res.json(await Application.find().populate('room', 'title city area rent').populate('student', 'name email phone warnings').populate('owner', 'name email').sort({ createdAt: -1 }))));
app.patch('/api/admin/applications/:id/status', auth, allow('admin'), wrap(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'shortlisted', 'accepted', 'declined', 'withdrawn'].includes(status)) return res.status(400).json({ message: 'Invalid application status.' });
  const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('room', 'title city area rent').populate('student', 'name email').populate('owner', 'name email');
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  res.json(application);
}));
app.post('/api/admin/applications/:id/warn', auth, allow('admin'), wrap(async (req, res) => {
  const reason = req.body.reason?.trim();
  if (!reason) return res.status(400).json({ message: 'Enter a reason for the warning.' });
  const application = await Application.findByIdAndUpdate(req.params.id, { $push: { warnings: { reason } } }, { new: true });
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  await User.findByIdAndUpdate(application.student, { $inc: { warningCount: 1 }, $push: { warnings: { reason } } });
  res.json(application);
}));

app.use((err, _req, res, _next) => {
  if (err.code === 11000) return res.status(409).json({ message: 'This request already exists.' });
  if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Set MONGODB_URI and JWT_SECRET in .env before starting the API.');
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && !(await User.exists({ role: 'admin' }))) {
      await User.create({ name: process.env.ADMIN_NAME || 'Rento Admin', email: process.env.ADMIN_EMAIL, password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin', accountStatus: 'active' });
      console.log('Initial admin account created. Remove ADMIN_PASSWORD from the environment after first startup.');
    }
    app.listen(port, () => console.log(`Rento API listening on http://localhost:${port}`));
  })
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
