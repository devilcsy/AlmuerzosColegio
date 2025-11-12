// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: {type: String,enum: ['STUDENT', 'PARENT', 'ADMIN'],default: 'STUDENT'},

  studentId: { type: String, sparse: true },
  department: { type: String, trim: true },
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default mongoose.model('User', userSchema);
