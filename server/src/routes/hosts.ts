import express, { type Request, type Response } from 'express';
import { HostService } from '../services/host.ts';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const hosts = await HostService.getAllHosts();
  res.send(hosts);
});

export default router;
