import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { createTransport, renderTemplate } from '../utils/email';

const router = Router();

const campaignSchema = z.object({
  name: z.string(),
  templateId: z.number(),
  segmentCity: z.string().nullable().optional(),
  segmentNiche: z.string().nullable().optional(),
  segmentService: z.string().nullable().optional(),
  onlyQualified: z.boolean().optional(),
  onlyNotContacted: z.boolean().optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
});

router.get('/', async (_req, res) => {
  res.json(await prisma.emailCampaign.findMany({ include: { template: true }, orderBy: { createdAt: 'desc' } }));
});

router.post('/', async (req, res) => {
  const parse = campaignSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const data = parse.data;
  const campaign = await prisma.emailCampaign.create({
    data: {
      name: data.name,
      templateId: data.templateId,
      segmentCity: data.segmentCity ?? null,
      segmentNiche: data.segmentNiche ?? null,
      segmentService: data.segmentService ?? null,
      onlyQualified: data.onlyQualified ?? true,
      onlyNotContacted: data.onlyNotContacted ?? false,
      status: data.scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
    },
  });
  res.json(campaign);
});

router.get('/:id', async (req, res) => {
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: Number(req.params.id) }, include: { template: true, logs: true } });
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  res.json(campaign);
});

router.post('/:id/simulate', async (req, res) => {
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: Number(req.params.id) } });
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  const leads = await selectLeadsForCampaign(campaign);
  res.json({ count: leads.length, sample: leads.slice(0, 5) });
});

router.post('/:id/send-test', async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: Number(req.params.id) }, include: { template: true } });
  if (!campaign || !campaign.template) return res.status(404).json({ error: 'Not found' });
  const transport = createTransport();
  await transport.sendMail({
    to: email,
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    subject: campaign.template.subject,
    html: campaign.template.bodyHtml,
  });
  res.json({ success: true });
});

router.post('/:id/send', async (req, res) => {
  const campaign = await prisma.emailCampaign.update({ where: { id: Number(req.params.id) }, data: { status: 'scheduled', scheduledFor: new Date() } });
  res.json(campaign);
});

async function selectLeadsForCampaign(campaign: any) {
  return prisma.lead.findMany({
    where: {
      email: { not: null },
      city: campaign.segmentCity ?? undefined,
      niche: campaign.segmentNiche ?? undefined,
      service: campaign.segmentService ?? undefined,
      isQualified: campaign.onlyQualified ? true : undefined,
      contacted: campaign.onlyNotContacted ? false : undefined,
    },
  });
}

export async function processCampaigns() {
  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      status: 'scheduled',
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: new Date() } },
      ],
    },
    include: { template: true },
  });

  const transport = createTransport();

  for (const campaign of campaigns) {
    const leads = await selectLeadsForCampaign(campaign);
    await prisma.emailCampaign.update({ where: { id: campaign.id }, data: { status: 'sending', totalRecipients: leads.length } });

    for (const lead of leads) {
      const rendered = renderTemplate(campaign.template!, lead);
      try {
        await transport.sendMail({
          to: lead.email,
          from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
          subject: rendered.subject,
          html: rendered.html,
        });
        await prisma.emailLog.create({ data: { campaignId: campaign.id, leadId: lead.id, email: lead.email, status: 'sent' } });
        await prisma.lead.update({ where: { id: lead.id }, data: { contacted: true, contactedAt: new Date() } });
      } catch (err: any) {
        await prisma.emailLog.create({ data: { campaignId: campaign.id, leadId: lead.id, email: lead.email, status: 'failed', errorMessage: err.message } });
      }
    }

    const counts = await prisma.emailLog.groupBy({
      by: ['campaignId', 'status'],
      where: { campaignId: campaign.id },
      _count: { _all: true },
    });
    const sentCount = counts.find((c) => c.status === 'sent')?._count._all || 0;
    const failedCount = counts.find((c) => c.status === 'failed')?._count._all || 0;
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: { status: 'sent', sentAt: new Date(), sentCount, failedCount },
    });
  }
}

export default router;
