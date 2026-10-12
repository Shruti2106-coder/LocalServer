import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/routes/authRoutes.js';
import categoryRoutes from './backend/routes/categoryRoutes.js';
import providerRoutes from './backend/routes/providerRoutes.js';
import bookingRoutes from './backend/routes/bookingRoutes.js';
import reviewRoutes from './backend/routes/reviewRoutes.js';
import paymentRoutes from './backend/routes/paymentRoutes.js';
import notificationRoutes from './backend/routes/notificationRoutes.js';
import messageRoutes from './backend/routes/messageRoutes.js';
import complaintRoutes from './backend/routes/complaintRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';
import aiRoutes from './backend/routes/aiRoutes.js';
import geocodeRoutes from './backend/routes/geocodeRoutes.js';
import { dbStore, IMessage } from './backend/db/store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Setup Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Attempt MongoDB connection if MONGODB_URI is provided
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB Atlas successfully.');
    } catch (err: any) {
      console.warn('MongoDB connection note: running in resilient in-memory mode:', err.message);
    }
  } else {
    console.log('LocalServe running in high-performance stateful in-memory mode.');
  }

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/providers', providerRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/geocode', geocodeRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'LocalServe API',
      timestamp: new Date().toISOString()
    });
  });

  // Socket.IO real-time handlers
  io.on('connection', (socket) => {
    socket.on('join_booking', (bookingId) => {
      socket.join(bookingId);
    });

    socket.on('send_message', (payload) => {
      const { bookingId, senderId, senderName, senderRole, receiverId, text } = payload;
      if (!bookingId || !text) return;

      const newMsg: IMessage = {
        _id: 'msg_' + Date.now(),
        bookingId,
        senderId,
        senderName: senderName || 'User',
        senderRole: senderRole || 'customer',
        receiverId,
        text,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      dbStore.messages.push(newMsg);

      // Broadcast to room
      io.to(bookingId).emit('new_message', newMsg);

      // Create notification
      dbStore.notifications.push({
        _id: 'notif_' + Date.now(),
        userId: receiverId,
        title: `Message from ${senderName}`,
        message: text.substring(0, 50),
        type: 'chat_message',
        isRead: false,
        link: `/chat/${bookingId}`,
        createdAt: new Date().toISOString()
      });
      io.emit(`notification_${receiverId}`, {
        title: `Message from ${senderName}`,
        message: text.substring(0, 50)
      });
    });

    socket.on('typing', (data) => {
      socket.to(data.bookingId).emit('user_typing', data);
    });

    socket.on('disconnect', () => {});
  });

  // Vite middleware in development or static in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`LocalServe server is running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
