import express, { type Express, type Request, type Response } from 'express';
import venues from './routes/venues.ts';
import cors from 'cors';
import { AppDataSource } from './db/data-source.ts';

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

AppDataSource.initialize()
  .then(() => {
    app.listen(8080, () => {
      console.log('server listening on port 8080');
    });
  })
  .catch((error) => {
    console.error('Failed to initialize the database connection', error);
    process.exit(1);
  });

export default app;
