import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MemoryStore from 'memorystore';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import routes from './routes';
import { AuthService } from './services/authService';

config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.vercel\.app$/, /localhost/] 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Session configuration with MemoryStore for Vercel compatibility
const MemStore = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'royal-fc-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: new MemStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Changed for cross-origin
  },
  name: 'royal-fc-session'
}));

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

// Handle 404
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Not Found' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`[express] Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Initialize default admin user
    try {
      await AuthService.initializeDefaultAdmin();
    } catch (error) {
      console.error('Failed to initialize default admin:', error);
    }
  });
}

export default app;
