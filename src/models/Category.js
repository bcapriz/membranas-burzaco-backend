import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    orden: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
