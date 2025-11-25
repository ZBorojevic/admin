import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';

const router = Router();

const contactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});

router.post('/', async (req, res) => {
  const parse = contactSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const data = parse.data;
  const existingLead = await prisma.lead.findUnique({ where: { email: data.email } });
  const leadId = existingLead
    ? existingLead.id
    : (
        await prisma.lead.create({
          data: { email: data.email, companyName: null, firstName: data.name, source: 'contact-form' },
        })
      ).id;
  const msg = await prisma.contactMessage.create({ data: { leadId, name: data.name, email: data.email, message: data.message, source: 'web_contact_form' } });
  res.json(msg);
});

export default router;
