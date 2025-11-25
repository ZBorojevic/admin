import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/auth';
import blogRoutes from './routes/blog';
import leadRoutes from './routes/leads';
import templateRoutes from './routes/templates';
import campaignRoutes, { processCampaigns } from './routes/campaigns';
import serviceRoutes from './routes/services';
import dashboardRoutes from './routes/dashboard';
import uploadRoutes from './routes/upload';
import contactRoutes from './routes/contact';
import { authMiddleware } from './middleware/auth';

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/admin/auth', authRoutes);
app.use('/api/contact', contactRoutes);

app.use('/api/admin', authMiddleware);
app.use('/api/admin/blog', blogRoutes);
app.use('/api/admin/leads', leadRoutes);
app.use('/api/admin/templates', templateRoutes);
app.use('/api/admin/campaigns', campaignRoutes);
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/upload', uploadRoutes);

setInterval(() => {
  processCampaigns().catch((err) => console.error('Campaign processing failed', err));
}, 60 * 1000);

export default app;
