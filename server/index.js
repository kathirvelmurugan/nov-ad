import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import { initStorage } from './storage.js';

import tenantsRouter from './routes/tenants.js';
import usersRouter from './routes/users.js';
import casesRouter from './routes/cases.js';
import adminRouter from './routes/admin.js';
import auditRouter from './routes/audit.js';
import storageRouter from './routes/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiRouter = express.Router();

// Mount modular sub-routers
apiRouter.use('/tenants', tenantsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/cases', casesRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/admin/cases', casesRouter);
apiRouter.use('/audit', auditRouter);
apiRouter.use('/', storageRouter);

// Mount API router for both direct /api and prefixed /:prefix/api (e.g. /feature-sarat/api)
app.use('/api', apiRouter);
app.use('/:prefix/api', apiRouter);

// Static files serving with cache-busting headers
const distPath = path.join(__dirname, '../dist');

app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || !req.path.includes('.')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(distPath));
app.use('/:prefix', express.static(distPath));
app.use((req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(distPath, 'index.html'));
});

// Server Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ALO DOCTOR Unified Backend Server running on port ${PORT}`);
  initDatabase().catch((e) => console.warn('Database init warning:', e.message));
  initStorage().catch((e) => console.warn('Storage init warning:', e.message));
});

export default app;
