import express from 'express';
import { createRateLimitMiddleware } from './src/rateLimitMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Single middleware layer — no per-route limit logic required.
app.use(createRateLimitMiddleware());

app.get('/api/sync/status', (_req, res) => {
  res.json({ status: 'idle', lastRun: null });
});

app.get('/api/resources', (_req, res) => {
  res.json({ items: [{ id: 1, name: 'widget' }] });
});

app.post('/api/sync/trigger', (_req, res) => {
  res.status(202).json({ jobId: 'sync-abc123', status: 'queued' });
});

app.put('/api/resources/:id', (req, res) => {
  res.json({ id: req.params.id, updated: true });
});

app.delete('/api/resources/:id', (req, res) => {
  res.status(204).send();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log('Try: curl -H "X-Org-Id: acme" -H "X-Org-Tier: standard" http://localhost:3000/api/resources');
});
