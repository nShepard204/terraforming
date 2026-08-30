import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { AppDataSource } from './db/data-source.ts';

try {
  await AppDataSource.initialize();
  console.log('Data Source has been initialized!');
} catch (error) {
  console.error('Error during Data Source initialization:', error);
}

const app: Express = express();

app.use(cors()); //TODO: Restrict to only frontend URLs.

app.get('/', async (req: Request, res: Response) => {
  try {
    res.send(`Hello World! This has been updated`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to the database.' });
  }
});

app.listen(8080, () => {
  console.log('server listening on port 8080');
});

export default app;
