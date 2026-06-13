import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import settingsRoutes from './src/routes/settings.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';

const app = express();

// --- CORS ---
// Whitelist: orígenes de desarrollo + los definidos en CLIENT_URL
// (acepta varios separados por coma, ej: "https://midominio.com.ar,https://www.midominio.com.ar")
const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowedOrigins = [...new Set([...devOrigins, ...envOrigins])];

app.use(
  cors({
    origin(origin, callback) {
      // Sin header Origin (curl, Postman, health checks) → permitir
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // cachea el preflight 24 h
  })
);
app.use(express.json({ limit: '1mb' }));

// Archivos subidos (imágenes de productos)
app.use('/uploads', express.static(path.resolve('uploads'), { maxAge: '7d' }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Manejo de errores (multer y demás)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 API escuchando en puerto ${PORT}`)))
  .catch((err) => {
    console.error('❌ Error al conectar MongoDB:', err.message);
    process.exit(1);
  });
