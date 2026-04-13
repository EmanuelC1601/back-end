const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Rutas
const authRoutes = require('./routes/authRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const moduloRoutes = require('./routes/moduloRoutes');
const permisosPerfilRoutes = require('./routes/permisosPerfilRoutes');
const menuRoutes = require('./routes/menuRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// 🔥 IMPORTANTE PARA RENDER
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

// 📁 Uploads
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 🔥 CORS FLEXIBLE (FIX REAL)
const allowedOrigins = [
  'https://eecangular.onrender.com',
  'http://localhost:4200'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(o => origin.includes(o));

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn('⚠️ CORS bloqueado:', origin);
      return callback(null, false);
    }
  },
  credentials: true
}));

// Middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Static uploads
app.use('/uploads', express.static(uploadsDir));

// ✅ API RUTAS CORREGIDAS (SINGULAR como espera el frontend)
app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);           // ✅ ANTES: /api/perfiles
app.use('/api/usuario', usuarioRoutes);         // ✅ ANTES: /api/usuarios
app.use('/api/modulo', moduloRoutes);           // ✅ ANTES: /api/modulos
app.use('/api/permisos-perfil', permisosPerfilRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/upload', uploadRoutes);

// Health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV,
    time: new Date()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'API funcionando 🚀'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  res.status(500).json({
    success: false,
    message: 'Error interno'
  });
});

// Start
app.listen(PORT, () => {
  console.log('==============================');
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
  console.log(`🌐 ENV: ${process.env.NODE_ENV}`);
  console.log('==============================');
});