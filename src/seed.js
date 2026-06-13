import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Setting from './models/Setting.js';

async function seed() {
  await connectDB();

  // --- Admin inicial ---
  const email = process.env.ADMIN_EMAIL || 'admin@burzaco.com.ar';
  const password = process.env.ADMIN_PASSWORD || 'cambiar123';
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({ nombre: 'Administrador', email, password });
    console.log(`👤 Admin creado: ${email}`);
  } else {
    console.log('👤 Admin ya existe, no se modifica');
  }

  // --- Configuración del sitio ---
  await Setting.getSite();
  console.log('⚙️  Configuración del sitio inicializada');

  // --- Categorías ---
  const cats = [
    { nombre: 'Membranas Asfálticas', slug: 'membranas-asfalticas', orden: 1 },
    { nombre: 'Emulsiones Asfálticas', slug: 'emulsiones-asfalticas', orden: 2 },
    { nombre: 'Geotextiles', slug: 'geotextiles', orden: 3 },
    { nombre: 'Pinturas Asfálticas', slug: 'pinturas-asfalticas', orden: 4 },
  ];
  const catDocs = {};
  for (const c of cats) {
    const doc = await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true });
    catDocs[c.slug] = doc;
  }
  console.log(`🗂️  ${cats.length} categorías listas`);

  // --- Productos de ejemplo (solo si la colección está vacía) ---
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      {
        nombre: 'Membrana Asfáltica',
        subtitulo: '4 mm Aluminizada',
        descripcion: 'Membrana asfáltica con terminación de aluminio, ideal para techos y terrazas expuestas. Excelente resistencia a los rayos UV y a la intemperie.',
        especificaciones: ['Espesor: 4 mm', 'Terminación: Aluminio', 'Presentación: Rollo 10 m²'],
        categoria: catDocs['membranas-asfalticas']._id,
        estado: 'publicado', destacado: true, orden: 1,
      },
      {
        nombre: 'Membrana Asfáltica',
        subtitulo: '4 mm Geotextil',
        descripcion: 'Membrana con refuerzo geotextil para sistemas de impermeabilización transitables o con carpeta de protección.',
        especificaciones: ['Espesor: 4 mm', 'Terminación: Geotextil', 'Presentación: Rollo 10 m²'],
        categoria: catDocs['membranas-asfalticas']._id,
        estado: 'publicado', orden: 2,
      },
      {
        nombre: 'Membrana Asfáltica',
        subtitulo: '3 mm',
        descripcion: 'Membrana asfáltica de 3 mm con terminación film, para usos generales de impermeabilización.',
        especificaciones: ['Espesor: 3 mm', 'Terminación: Film', 'Presentación: Rollo 10 m²'],
        categoria: catDocs['membranas-asfalticas']._id,
        estado: 'publicado', orden: 3,
      },
      {
        nombre: 'Emulsión Asfáltica',
        subtitulo: 'Impermeabilizante',
        descripcion: 'Emulsión asfáltica de uso en frío con alto poder penetrante. Ideal como imprimación o impermeabilizante de superficies.',
        especificaciones: ['Uso en frío', 'Alto poder penetrante', 'Presentación: 18 L'],
        categoria: catDocs['emulsiones-asfalticas']._id,
        estado: 'publicado', destacado: true, orden: 4,
      },
      {
        nombre: 'Geotextil No Tejido',
        subtitulo: '200 gr',
        descripcion: 'Geotextil no tejido para separación y protección de membranas en sistemas multicapa.',
        especificaciones: ['Gramaje: 200 gr/m²', 'Función: Separación y protección', 'Presentación: Rollo 50 m²'],
        categoria: catDocs['geotextiles']._id,
        estado: 'publicado', orden: 5,
      },
    ]);
    console.log('📦 Productos de ejemplo cargados');
  } else {
    console.log(`📦 Ya existen ${count} productos, no se cargan ejemplos`);
  }

  await mongoose.disconnect();
  console.log('✅ Seed finalizado');
}

seed().catch((err) => { console.error(err); process.exit(1); });
