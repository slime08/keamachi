import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Serve static files from the client's build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// For any other requests, serve the client's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Mock routes for development
app.get('/api/facilities', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'サンシャイン福祉センター',
      location: '東京都渋谷区',
      service_type: '訪問介護',
      description: '高齢者向けの訪問介護サービスを提供しています'
    },
    {
      id: 2,
      name: 'ケアホーム山田',
      location: '東京都新宿区',
      service_type: 'グループホーム',
      description: '認知症対応のグループホームです'
    },
    {
      id: 3,
      name: 'デイサービス太陽',
      location: '東京都渋谷区',
      service_type: 'デイサービス',
      description: '日中の介護・リハビリサービスを提供'
    }
  ]);
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, role } = req.body;
  res.status(201).json({
    user: {
      id: Math.floor(Math.random() * 1000),
      email,
      name,
      role
    },
    token: 'mock-token-' + Math.random().toString(36).substr(2, 9)
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  res.json({
    user: {
      id: 1,
      email,
      name: 'テストユーザー',
      role: 'user'
    },
    token: 'mock-token-' + Math.random().toString(36).substr(2, 9)
  });
});

// WebSocket設定
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('send_message', (data) => {
    io.to(`conversation_${data.conversationId}`).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Frontend should connect to http://localhost:5173`);
});

export default app;
