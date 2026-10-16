import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { Room, User } from './models.js';

if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env first.');

const examples = [
  {
    sampleKey: 'rento-demo-bengaluru-single', title: 'Bright private room near Christ University', city: 'Bengaluru', area: 'SG Palya', roomType: 'Single room',
    address: 'Example listing · SG Palya', rent: 9200, size: 15, features: ['Furnished', 'Wi-Fi', 'Study desk', '24/7 security'],
    utilities: { water: 'Included', electricity: '₹8 per unit', other: 'Wi-Fi included' },
    description: 'A bright, furnished private room in a student-friendly home near Christ University. Includes a study desk, wardrobe, reliable Wi-Fi, and shared kitchen access. Water is included in the rent; electricity is charged by meter.',
    deposit: 9200, minimumStayMonths: 4, furnishing: 'Furnished', bathroom: 'Shared', availableFrom: new Date('2026-11-01'),
    images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1400','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000','https://images.unsplash.com/photo-1615874694520-474822394e73?q=80&w=1000'],
    reviews: [{ name:'Aarav M.', college:'Christ University', rating:5, title:'Great place to focus on studies', comment:'The room was clean and the study desk and Wi-Fi made semester life much easier. The host answered questions quickly.', isSample:true },{ name:'Diya R.', college:'Jain University', rating:4, title:'Comfortable and well connected', comment:'A calm room in a convenient area. Water is included and the shared kitchen was useful during my stay.', isSample:true }],
  },
  {
    sampleKey: 'rento-demo-pune-shared', title: 'Affordable twin-sharing PG close to campus', city: 'Pune', area: 'Viman Nagar', roomType: 'Shared room',
    address: 'Example listing · Viman Nagar', rent: 5800, size: 20, features: ['Twin sharing', 'Meals available', 'Laundry', 'Wi-Fi'],
    utilities: { water: 'Included', electricity: 'Included up to fair use', other: 'Meals optional · ₹2,000/month' },
    description: 'A comfortable twin-sharing room with two beds, wardrobes, laundry access, and common study space. The monthly rent includes water and electricity up to fair use. Optional meal plan is available at an additional monthly charge.',
    deposit: 5800, minimumStayMonths: 3, furnishing: 'Furnished', bathroom: 'Shared', availableFrom: new Date('2026-11-01'),
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1400','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000','https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000'],
    reviews: [{ name:'Rohan S.', college:'Symbiosis', rating:4, title:'Good value near campus', comment:'The room and shared facilities are practical for students. Optional meals are convenient on busy days.', isSample:true },{ name:'Meera K.', college:'MIT-WPU', rating:5, title:'Friendly student community', comment:'I liked having laundry and a common study space. The monthly costs were clear before I applied.', isSample:true }],
  },
  {
    sampleKey: 'rento-demo-delhi-studio', title: 'Compact furnished studio near North Campus', city: 'Delhi', area: 'Kamla Nagar', roomType: 'Studio',
    address: 'Example listing · Kamla Nagar', rent: 14500, size: 27, features: ['Private kitchenette', 'Furnished', 'Balcony', 'Metro nearby'],
    utilities: { water: 'Included', electricity: 'Separate meter', other: 'Maintenance included' },
    description: 'A self-contained studio with a private kitchenette and balcony, convenient for students at Delhi University North Campus. Maintenance and water are included. Electricity is billed separately based on usage.',
    deposit: 14500, minimumStayMonths: 6, furnishing: 'Furnished', bathroom: 'Private', availableFrom: new Date('2026-11-15'),
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1400','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000'],
    reviews: [{ name:'Ananya P.', college:'Delhi University', rating:5, title:'Private and peaceful', comment:'A compact studio with the privacy I needed for the semester. The balcony and kitchenette are a real plus.', isSample:true },{ name:'Kabir T.', college:'Delhi University', rating:4, title:'Exactly as described', comment:'Maintenance and water being included makes the budget easy to plan. Metro access is helpful too.', isSample:true }],
  },
  {
    sampleKey: 'rento-demo-hyderabad-pg', title: 'Quiet furnished PG room near Gachibowli', city: 'Hyderabad', area: 'Gachibowli', roomType: 'PG',
    address: 'Example listing · Gachibowli', rent: 7800, size: 17, features: ['Furnished', 'Attached bathroom', 'Power backup', 'Common kitchen'],
    utilities: { water: 'Included', electricity: '₹500 fixed monthly', other: 'Power backup included' },
    description: 'A clean furnished PG room in a quiet building near Gachibowli. The room has an attached bathroom and access to a common kitchen. Water and power backup are included; electricity is charged at a fixed monthly amount.',
    deposit: 7800, minimumStayMonths: 3, furnishing: 'Furnished', bathroom: 'Attached', availableFrom: new Date('2026-11-01'),
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400','https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1000','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000'],
    reviews: [{ name:'Ishita N.', college:'IIIT Hyderabad', rating:5, title:'Quiet and comfortable', comment:'The attached bathroom and power backup are very convenient. The building felt peaceful throughout my stay.', isSample:true },{ name:'Dev A.', college:'University of Hyderabad', rating:4, title:'A solid PG option', comment:'Clean furnished room and easy access to the common kitchen. Electricity charges were explained upfront.', isSample:true }],
  },
];

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Room.init();
  let owner = await User.findOne({ email: 'sample-host@rento.local' });
  if (!owner) {
    owner = await User.create({
      name: 'Rento Sample Host', email: 'sample-host@rento.local', role: 'owner', accountStatus: 'approved',
      password: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
    });
  }
  for (const example of examples) {
    await Room.findOneAndUpdate(
      { sampleKey: example.sampleKey },
      { $set: { ...example, owner: owner._id, status: 'available', isSample: true } },
      { upsert: true, new: true, runValidators: true },
    );
  }
  console.log(`Sample listings ready: ${examples.length}`);
} finally {
  await mongoose.disconnect();
}
