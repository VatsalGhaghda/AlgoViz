import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import executionRouter from './routes/execution.route';

dotenv.config();

const app: Express = express();

app.use(cors({
  origin: (process.env.CORS_ORIGIN || "http://localhost:5173").replace(/\/$/, ""),
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json({ limit: '55kb' })); // Slightly above 50KB code limit to include JSON wrapper

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Backend is healthy' });
});

// Python execution gateway — proxies to the internal execution service
app.use('/api/execute', executionRouter);

export default app;
