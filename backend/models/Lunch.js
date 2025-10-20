// models/Lunch.js
import mongoose from 'mongoose';

const lunchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 5.00
  },
  description: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Lunch', lunchSchema);