import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import routes from './routes';
import path from 'path';
import { authService } from './services/authService';

config();

const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid conflicts

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [/\.vercel\.app$/, /localhost/]
    : ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:5001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// API routes
app.use('/api', routes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404 for API routes
app.use('/api/*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// For all other routes, serve static files in production or return a message in development
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the dist/public directory
  const staticPath = path.resolve(process.cwd(), 'dist/public');
  app.use(express.static(staticPath));

  // For any other routes, serve the index.html file
  app.use('*', (req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve(staticPath, 'index.html'));
  });
} else {
  // In development, return a message
  app.use('*', (req: express.Request, res: express.Response) => {
    res.status(200).json({ message: 'API server is running. Please use the client development server for the UI.' });
  });
}

if (process.env.NODE_ENV !== 'test') {
  // Ensure admin user exists before starting the server
  authService.ensureAdminExists().then(() => {
    app.listen(PORT, () => {
      console.log(`[express] API server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`[express] For the UI, please run 'npm run dev:client' in a separate terminal`);
    });
  }).catch(err => {
    console.error('Failed to ensure admin user exists:', err);
    process.exit(1);
  });
}

export default app;
