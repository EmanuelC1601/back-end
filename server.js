const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar nuevas rutas
const authRoutes = require('./routes/authRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const moduloRoutes = require('./routes/moduloRoutes');
const permisosPerfilRoutes = require('./routes/permisosPerfilRoutes');
const menuRoutes = require('./routes/menuRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Crear aplicación Express
const app = express();

// Obtener puerto de Render o usar 3000 local
const PORT = process.env.PORT || 3000;
// Escuchar en todas las interfaces en Render, localhost en desarrollo
const HOST = process.env.RENDER ? '0.0.0.0' : 'localhost';

// Configurar uploads según entorno
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'  // En Render, usa temporal
  : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware CORS configurado dinámicamente
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://eecangular.onrender.com', // ✅ TU FRONTEND REAL (ajusta según tu dominio)
      'http://localhost:4200',
      'https://backend-bhit.onrender.com' // Opcional: tu propio backend si es necesario
    ]
  : ['http://localhost:4200'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen (Postman, curl, etc) o desde orígenes permitidos
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `Origen ${origin} no permitido por CORS`;
      console.warn('⚠️ CORS bloqueado:', msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Servir archivos estáticos (solo en desarrollo, o con advertencia en producción)
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(uploadsDir));
} else {
  // En producción, manejar archivos estáticos con advertencia
  app.use('/uploads', express.static(uploadsDir), (req, res, next) => {
    if (req.method === 'GET') {
      console.warn('⚠️ Accediendo a archivo estático en producción:', req.path);
    }
    next();
  });
}

// Rutas API (nuevas)
app.use('/api/auth', authRoutes);
app.use('/api/perfiles', perfilRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/modulos', moduloRoutes);
app.use('/api/permisos-perfil', permisosPerfilRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/upload', uploadRoutes);

// Ruta de prueba de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    host: HOST,
    port: PORT,
    renderUrl: process.env.RENDER_EXTERNAL_URL,
    uploadsDir: uploadsDir
  });
});

// Ruta de inicio mejorada con los nuevos endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'API del Proyecto - Tercera Unidad',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify'
      },
      perfiles: {
        listar: 'GET /api/perfiles',
        detalle: 'GET /api/perfiles/:id',
        crear: 'POST /api/perfiles',
        actualizar: 'PUT /api/perfiles/:id',
        eliminar: 'DELETE /api/perfiles/:id'
      },
      usuarios: {
        listar: 'GET /api/usuarios',
        detalle: 'GET /api/usuarios/:id',
        crear: 'POST /api/usuarios',
        actualizar: 'PUT /api/usuarios/:id',
        eliminar: 'DELETE /api/usuarios/:id'
      },
      modulos: {
        listar: 'GET /api/modulos',
        detalle: 'GET /api/modulos/:id',
        crear: 'POST /api/modulos',
        actualizar: 'PUT /api/modulos/:id',
        eliminar: 'DELETE /api/modulos/:id'
      },
      permisos: {
        listar: 'GET /api/permisos-perfil',
        detalle: 'GET /api/permisos-perfil/:id',
        porPerfil: 'GET /api/permisos-perfil/perfil/:idPerfil',
        crear: 'POST /api/permisos-perfil',
        actualizar: 'PUT /api/permisos-perfil/:id',
        eliminar: 'DELETE /api/permisos-perfil/:id'
      },
      menu: 'GET /api/menu',
      upload: {
        imagenUsuario: 'POST /api/upload/usuario/:id'
      }
    },
    info: {
      host: HOST,
      port: PORT,
      uploads: uploadsDir,
      render: process.env.RENDER ? 'Sí' : 'No',
      warning: process.env.NODE_ENV === 'production' ? 'Uploads son temporales en plan Free' : null
    }
  });
});

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err);
  
  // Manejar errores de CORS específicamente
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Acceso bloqueado por política CORS',
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor con configuración mejorada
app.listen(PORT, HOST, () => {
  console.log('='.repeat(60));
  console.log(`🚀 SERVIDOR INICIADO CORRECTAMENTE`);
  console.log('='.repeat(60));
  console.log(`✅ Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Host: ${HOST}`);
  console.log(`✅ Puerto: ${PORT}`);
  console.log(`✅ Uploads: ${uploadsDir}`);
  
  if (process.env.RENDER_EXTERNAL_URL) {
    console.log(`🌐 URL Pública: ${process.env.RENDER_EXTERNAL_URL}`);
  }
  
  console.log(`📊 Variables: RENDER=${process.env.RENDER ? 'Sí' : 'No'}`);
  console.log('='.repeat(60));
  console.log(`👂 Escuchando peticiones...`);
  console.log('='.repeat(60));
});