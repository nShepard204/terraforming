import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import cron from 'node-cron';
import path from 'node:path';

cron.schedule(
  '0 * * * *',
  path.join(import.meta.dirname, './tasks/eventScraper.js')
);

const app: Express = express();

app.use(cors());

app.get('/', async (req: Request, res: Response) => {
  try {
    res.send(`Hello World! This has been updated`);
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Failed to connect to the database.' });
  }
});

app.listen(8080, () => {
  console.log('server listening on port 8080');
});

export default app;
