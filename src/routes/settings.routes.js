import { Router } from 'express';
import Setting from '../models/Setting.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/settings (público — la landing necesita WhatsApp, dirección, etc.)
router.get('/', async (_req, res) => {
  const settings = await Setting.getSite();
  res.json(settings);
});

// PUT /api/settings (admin)
router.put('/', requireAuth, async (req, res) => {
  const allowed = [
    'whatsapp', 'whatsappDisplay', 'instagram', 'email',
    'telefono', 'direccion', 'horarios', 'mensajeWhatsApp',
  ];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  const settings = await Setting.findOneAndUpdate({ key: 'site' }, update, {
    new: true,
    upsert: true,
  });
  res.json(settings);
});

export default router;
