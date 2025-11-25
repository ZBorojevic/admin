import { Router } from 'express';
import multer from 'multer';
import path from 'path';

const upload = multer({ dest: path.join('uploads') });
const router = Router();

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Missing file' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
