import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { prisma } from '../prisma';

const router = Router();

const serviceSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  baseUrl: z.string(),
  healthcheckPath: z.string(),
  processName: z.string().nullable().optional(),
});

router.get('/', async (_req, res) => {
  res.json(await prisma.service.findMany());
});

router.post('/', async (req, res) => {
  const parse = serviceSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  res.json(await prisma.service.create({ data: parse.data }));
});

router.put('/:id', async (req, res) => {
  const parse = serviceSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  res.json(await prisma.service.update({ where: { id: Number(req.params.id) }, data: parse.data }));
});

router.delete('/:id', async (req, res) => {
  await prisma.service.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.get('/:id/health', async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: Number(req.params.id) } });
  if (!service) return res.status(404).json({ error: 'Not found' });
  try {
    const response = await axios.get(`${service.baseUrl}${service.healthcheckPath}`);
    res.json({ status: response.status === 200 ? 'UP' : 'DOWN' });
  } catch (err: any) {
    res.json({ status: 'DOWN', error: err.message });
  }
});

export default router;
