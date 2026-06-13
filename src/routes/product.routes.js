import { Router } from 'express';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/products (público) — solo publicados
// query: ?categoria=<id>&destacado=true
router.get('/', async (req, res) => {
  const filter = { estado: 'publicado' };
  if (req.query.categoria) filter.categoria = req.query.categoria;
  if (req.query.destacado === 'true') filter.destacado = true;

  const productos = await Product.find(filter)
    .populate('categoria', 'nombre slug')
    .sort({ destacado: -1, orden: 1, createdAt: -1 });
  res.json(productos);
});

// GET /api/products/admin (admin) — todos, con paginación
router.get('/admin', requireAuth, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const filter = {};
  if (req.query.estado) filter.estado = req.query.estado;
  if (req.query.categoria) filter.categoria = req.query.categoria;
  if (req.query.q) filter.nombre = { $regex: req.query.q, $options: 'i' };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('categoria', 'nombre')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/products/stats (admin) — métricas del dashboard
router.get('/stats', requireAuth, async (_req, res) => {
  const [total, publicados, destacados, borradores, sinImagen] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ estado: 'publicado' }),
    Product.countDocuments({ destacado: true }),
    Product.countDocuments({ estado: 'borrador' }),
    Product.countDocuments({ $or: [{ imagen: '' }, { imagen: null }] }),
  ]);
  res.json({ total, publicados, destacados, borradores, sinImagen });
});

// GET /api/products/:id (público para el modal)
router.get('/:id', async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id).populate('categoria', 'nombre slug');
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch {
    res.status(400).json({ error: 'ID inválido' });
  }
});

// POST /api/products (admin)
router.post('/', requireAuth, async (req, res) => {
  try {
    const producto = await Product.create(req.body);
    res.status(201).json(producto);
  } catch (err) {
    res.status(400).json({ error: 'No se pudo crear el producto', detail: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(400).json({ error: 'No se pudo actualizar el producto', detail: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
