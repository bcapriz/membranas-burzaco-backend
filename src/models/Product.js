import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    subtitulo: { type: String, trim: true, default: '' },
    descripcion: { type: String, default: '' },
    especificaciones: [{ type: String }],
    imagen: { type: String, default: '' },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    estado: { type: String, enum: ['publicado', 'borrador'], default: 'borrador' },
    destacado: { type: Boolean, default: false },
    orden: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ estado: 1, destacado: -1, orden: 1 });

export default mongoose.model('Product', productSchema);
