import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

const router = Router();

const postSchema = z.object({
  title: z.string(),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string(),
  featuredImageUrl: z.string().optional(),
  status: z.enum(['draft', 'published']),
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

router.get('/posts', async (req, res) => {
  const { status, search } = req.query;
  const posts = await prisma.blogPost.findMany({
    where: {
      status: status ? String(status) as any : undefined,
      title: search ? { contains: String(search), mode: 'insensitive' } : undefined,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

router.get('/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { categories: true, tags: true },
  });
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

router.post('/posts', async (req, res) => {
  const parse = postSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const data = parse.data;

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featuredImageUrl: data.featuredImageUrl,
      status: data.status as any,
      publishedAt: data.status === 'published' ? data.publishedAt ? new Date(data.publishedAt) : new Date() : null,
      categories: data.categoryIds
        ? { createMany: { data: data.categoryIds.map((id) => ({ categoryId: id })) } }
        : undefined,
      tags: data.tagIds
        ? { createMany: { data: data.tagIds.map((id) => ({ tagId: id })) } }
        : undefined,
    },
  });
  res.json(post);
});

router.put('/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parse = postSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  const data = parse.data;

  await prisma.postCategory.deleteMany({ where: { postId: id } });
  await prisma.postTag.deleteMany({ where: { postId: id } });

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featuredImageUrl: data.featuredImageUrl,
      status: data.status as any,
      publishedAt: data.status === 'published' ? data.publishedAt ? new Date(data.publishedAt) : new Date() : null,
      categories: data.categoryIds
        ? { createMany: { data: data.categoryIds.map((catId) => ({ categoryId: catId })) } }
        : undefined,
      tags: data.tagIds
        ? { createMany: { data: data.tagIds.map((tagId) => ({ tagId })) } }
        : undefined,
    },
  });
  res.json(post);
});

router.delete('/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.blogPost.delete({ where: { id } });
  res.json({ success: true });
});

const taxonomySchema = z.object({
  name: z.string(),
  slug: z.string(),
});

router.get('/categories', async (_req, res) => {
  res.json(await prisma.category.findMany());
});
router.post('/categories', async (req, res) => {
  const parse = taxonomySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  res.json(await prisma.category.create({ data: parse.data }));
});
router.put('/categories/:id', async (req, res) => {
  const parse = taxonomySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  res.json(await prisma.category.update({ where: { id: Number(req.params.id) }, data: parse.data }));
});
router.delete('/categories/:id', async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.get('/tags', async (_req, res) => {
  res.json(await prisma.tag.findMany());
});
router.post('/tags', async (req, res) => {
  const parse = taxonomySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  res.json(await prisma.tag.create({ data: parse.data }));
});
router.put('/tags/:id', async (req, res) => {
  const parse = taxonomySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);
  res.json(await prisma.tag.update({ where: { id: Number(req.params.id) }, data: parse.data }));
});
router.delete('/tags/:id', async (req, res) => {
  await prisma.tag.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
