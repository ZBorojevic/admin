import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';

const router = Router();

const templateSchema = z.object({
  name: z.string(),
  subject: z.string(),
  bodyHtml: z.string(),
});

router.get('/', async (_req, res) => {
  res.json(await prisma.emailTemplate.findMany({ orderBy: { createdAt: 'desc' } }));
});

router.post('/', async (req, res) => {
  const parse = templateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  res.json(await prisma.emailTemplate.create({ data: parse.data }));
});

router.get('/:id', async (req, res) => {
  const template = await prisma.emailTemplate.findUnique({ where: { id: Number(req.params.id) } });
  if (!template) return res.status(404).json({ error: 'Not found' });
  res.json(template);
});

router.put('/:id', async (req, res) => {
  const parse = templateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  res.json(await prisma.emailTemplate.update({ where: { id: Number(req.params.id) }, data: parse.data }));
});

router.delete('/:id', async (req, res) => {
  await prisma.emailTemplate.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
