import express, { type Express, type Request, type Response } from 'express';
import cors, { CorsOptions } from 'cors';
import { AppDataSource } from './db/data-source.ts';
import events from './routes/events.ts';

const allowedOrigins = [
  'https://terraforming-ygo.vercel.app',
  'http://localhost:5173',
];

const app: Express = express();
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use('events', events);

app.get('/', async (req: Request, res: Response) => {
  try {
    res.send(`Hello World! This has been updated`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to the database.' });
  }
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connection successful');
    app.listen(8080, () => {
      console.log('server listening on port 8080');
    });
  })
  .catch((err) => console.log(err));

export default app;
