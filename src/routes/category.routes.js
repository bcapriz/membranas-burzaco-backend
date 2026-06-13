import { Router } from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET /api/categories (público)
router.get('/', async (_req, res) => {
  const categorias = await Category.find().sort({ orden: 1, nombre: 1 });
  res.json(categorias);
});

// POST /api/categories (admin)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { nombre, orden = 0 } = req.body;
    const cat = await Category.create({ nombre, orden, slug: slugify(nombre) });
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'La categoría ya existe' });
    res.status(400).json({ error: 'No se pudo crear la categoría' });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { nombre, orden } = req.body;
    const update = { ...(orden !== undefined && { orden }) };
    if (nombre) { update.nombre = nombre; update.slug = slugify(nombre); }
    const cat = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cat) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(cat);
  } catch {
    res.status(400).json({ error: 'No se pudo actualizar la categoría' });
  }
});

// DELETE /api/categories/:id (admin) — solo si no tiene productos
router.delete('/:id', requireAuth, async (req, res) => {
  const enUso = await Product.countDocuments({ categoria: req.params.id });
  if (enUso > 0) return res.status(409).json({ error: `Hay ${enUso} producto(s) en esta categoría` });
  await Category.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
