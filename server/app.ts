import express, { type Express, type Request, type Response } from 'express';
import venues from './src/routes/venues.ts';
import cors from 'cors';

const app: Express = express();

app.use(cors()); //TODO: Restrict to only frontend URLs.
app.use('/venues', venues);

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
