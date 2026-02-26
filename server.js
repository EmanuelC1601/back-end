const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar rutas
const registroRoutes = require('./routes/registros');
const imagenRoutes = require('./routes/imagenes');
const mensajesRoutes = require('./routes/mensajes');

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
      'https://eecangular.onrender.com', // ✅ TU FRONTEND REAL
      'http://localhost:4200',
      'https://backend-bhit.onrender.com'
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

// Servir archivos estáticos (solo en desarrollo)
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

// Rutas API
app.use('/api/registros', registroRoutes);
app.use('/api/imagenes', imagenRoutes);
app.use('/api/mensajes', mensajesRoutes);

// Ruta de prueba mejorada
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

// Ruta de inicio mejorada
app.get('/', (req, res) => {
  res.json({
    message: 'API del Proyecto Angular',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: 'GET /api/health',
      registros: {
        insertar: 'POST /api/registros/insertar-automatico',
        registrar: 'POST /api/registros/registrar-usuario',
        listar: 'GET /api/registros/obtener-registros'
      },
      imagenes: {
        subir: 'POST /api/imagenes/subir',
        listar: 'GET /api/imagenes/obtener-todas',
        eliminar: 'DELETE /api/imagenes/eliminar/:id',
        ver: 'GET /api/imagenes/:filename'
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
