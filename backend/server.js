// Using CommonJS
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const path = require('path');
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Connect to MongoDB Atlas
connectDB();

const app = express();
const server = http.createServer(app);

// ---------- Socket.io ----------
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('join-admin-room', () => socket.join('admin-room'));
  socket.on('join-user-room', (userId) => socket.join(`user-${userId}`));
  socket.on('disconnect', () => {});
});

app.set('io', io);

// ---------- Core / Security Middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/', (req, res) => {
    res.send('🧶 Crochet Nest API is running smoothly 🧶');
});

app.use('/api', generalLimiter);

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Crochet Nest API is running smoothly 🧶' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/custom-orders', require('./routes/customOrderRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/analytics', require('./routes/analyticsRoutes'));

// ---------- Error Handling ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🧶 Crochet Nest API server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };