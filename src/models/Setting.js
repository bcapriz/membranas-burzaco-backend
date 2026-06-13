import mongoose from 'mongoose';

// Documento único de configuración del sitio
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    whatsapp: { type: String, default: '5491149753016' },
    whatsappDisplay: { type: String, default: '11 4975-3016' },
    instagram: { type: String, default: 'membranasburzaco' },
    email: { type: String, default: 'info@membranasburzaco.com.ar' },
    telefono: { type: String, default: '(011) 4299-1238' },
    direccion: { type: String, default: 'Av. Espora 2222, Burzaco, Buenos Aires' },
    horarios: { type: String, default: 'Lunes a Viernes: 8:00 a 17:00 hs · Sábados: 8:00 a 12:00 hs' },
    mensajeWhatsApp: { type: String, default: 'Hola, quería consultar por {producto}.' },
  },
  { timestamps: true }
);

settingSchema.statics.getSite = async function () {
  let doc = await this.findOne({ key: 'site' });
  if (!doc) doc = await this.create({ key: 'site' });
  return doc;
};

export default mongoose.model('Setting', settingSchema);
