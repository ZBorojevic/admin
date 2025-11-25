import { Router } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { prisma } from '../prisma';
import { z } from 'zod';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });
const router = Router();

const leadSchema = z.object({
  companyName: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  email: z.string().email(),
  tel: z.string().nullable().optional(),
  niche: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  service: z.string().nullable().optional(),
  isQualified: z.boolean().optional(),
  contacted: z.boolean().optional(),
  contactedAt: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

router.get('/', async (req, res) => {
  const { city, niche, service, isQualified, contacted, search } = req.query;
  const leads = await prisma.lead.findMany({
    where: {
      city: city ? String(city) : undefined,
      niche: niche ? String(niche) : undefined,
      service: service ? String(service) : undefined,
      isQualified: isQualified !== undefined ? isQualified === 'true' : undefined,
      contacted: contacted !== undefined ? contacted === 'true' : undefined,
      OR: search
        ? [
            { companyName: { contains: String(search), mode: 'insensitive' } },
            { firstName: { contains: String(search), mode: 'insensitive' } },
            { lastName: { contains: String(search), mode: 'insensitive' } },
            { email: { contains: String(search), mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(leads);
});

router.get('/:id', async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: Number(req.params.id) } });
  if (!lead) return res.status(404).json({ error: 'Not found' });
  res.json(lead);
});

router.post('/', async (req, res) => {
  const parse = leadSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const data = parse.data;
  const lead = await prisma.lead.create({ data: { ...data, contactedAt: data.contactedAt ? new Date(data.contactedAt) : undefined } });
  res.json(lead);
});

router.put('/:id', async (req, res) => {
  const parse = leadSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const data = parse.data;
  const lead = await prisma.lead.update({ where: { id: Number(req.params.id) }, data: { ...data, contactedAt: data.contactedAt ? new Date(data.contactedAt) : undefined } });
  res.json(lead);
});

router.delete('/:id', async (req, res) => {
  await prisma.lead.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.post('/import', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Missing file' });
  const csv = parse(await fs.promises.readFile(req.file.path), { columns: true, skip_empty_lines: true });
  let insertedCount = 0;
  let updatedCount = 0;
  const errors: string[] = [];

  for (const row of csv) {
    try {
      const email = String(row.email || row.email)?.trim();
      if (!email) continue;
      const existing = await prisma.lead.findUnique({ where: { email } });
      const payload = {
        companyName: row.company_name || row.companyName || null,
        firstName: row.first_name || row.firstName || null,
        lastName: row.last_name || row.lastName || null,
        title: row.title || null,
        email,
        tel: row.tel || null,
        niche: row.niche || null,
        city: row.city || null,
        website: row.website || null,
        service: row.service || null,
        isQualified: ['true', '1', true, 1].includes((row.is_qualified || row.isQualified || '').toString().toLowerCase()),
        contacted: ['true', '1', true, 1].includes((row.contacted || '').toString().toLowerCase()),
        source: 'gsheet-import',
      };
      if (existing) {
        await prisma.lead.update({ where: { email }, data: payload });
        updatedCount++;
      } else {
        await prisma.lead.create({ data: payload });
        insertedCount++;
      }
    } catch (err: any) {
      errors.push(err.message);
    }
  }

  res.json({ insertedCount, updatedCount, errors });
});

export default router;
