import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (_req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [newLeads, qualifiedLeads, sentEmails, publishedPosts, latestLeads, latestMessages] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.lead.count({ where: { isQualified: true } }),
    prisma.emailLog.count({ where: { sentAt: { gte: thirtyDaysAgo } } }),
    prisma.blogPost.count({ where: { status: 'published' } }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  res.json({
    newLeads,
    qualifiedLeads,
    sentEmails,
    publishedPosts,
    latestLeads,
    latestMessages,
  });
});

export default router;
