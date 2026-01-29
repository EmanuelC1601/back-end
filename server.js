const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar rutas
const registroRoutes = require('./routes/registros');
const imagenRoutes = require('./routes/imagenes');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'https://backend-bhit.onrender.com'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api/registros', registroRoutes);
app.use('/api/imagenes', imagenRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de inicio
app.get('/', (req, res) => {
  res.json({
    message: 'API del Proyecto Angular',
    version: '1.0.0',
    endpoints: {
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
    }
  });
});

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Uploads: ${uploadsDir}`);
});
