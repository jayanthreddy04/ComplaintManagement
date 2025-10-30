const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// --- CORS CONFIGURATION: Dynamic for Production/Development ---
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction
    // In production, allow the Angular frontend on the same domain
    ? [process.env.RENDER_EXTERNAL_URL] 
    // In development, allow the Angular dev server
    : ['http://localhost:4200'];

const corsOptions = {
    // Dynamically set origin based on environment
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true); 
        // Allow if the origin is in our allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // If not in the allowed list
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply the configured CORS middleware
app.use(cors(corsOptions));
// --- END CORS CONFIGURATION ---

// Middleware
app.use(express.json());
// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes (MUST come BEFORE the static file serving) ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chatbot', require('./routes/chatbot'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log('MongoDB Connection Error:', err));


// --- CRITICAL DEPLOYMENT STEP: SERVING ANGULAR FRONTEND ---
// Only enable this section when deploying to production (like Render)
if (isProduction) {
    // 1. Define the path to the Angular build output directory (relative to backend/)
    // NOTE: Replace 'frontend' with your Angular project name if it's different in dist/
    const frontendPath = path.join(__dirname, '..', 'frontend', 'dist', 'frontend'); 
    
    // 2. Serve static files from the Angular build directory
    app.use(express.static(frontendPath)); 
    
    // 3. For any non-API GET request, serve the Angular index.html file.
    // This allows client-side routing (e.g., refreshing /dashboard works).
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(frontendPath, 'index.html'));
    });
}
// --- END DEPLOYMENT STEP ---


// Port (Use environment variable for Render, fallback to 3000 for local dev)
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});