const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ImagenController = require('../controllers/imagenController');

// Configurar directorio de uploads según entorno
const uploadDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : 'uploads/';

// Asegurar que el directorio exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para almacenar imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const safeName = nameWithoutExt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, safeName + '-' + uniqueSuffix + ext);
  }
});

// Filtrar por tipo de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Solo se permiten imágenes (jpeg, jpg, png, gif, webp, svg)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB límite
    files: 1 // Solo un archivo
  },
  fileFilter: fileFilter
});

// Middleware de manejo de errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Solo se permite subir una imagen a la vez'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Error al procesar el archivo: ' + err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Subir imagen
router.post('/subir', upload.single('imagen'), handleMulterError, ImagenController.subirImagen);

// Obtener todas las imágenes
router.get('/obtener-todas', ImagenController.obtenerImagenes);

// Eliminar imagen
router.delete('/eliminar/:id', ImagenController.eliminarImagen);

// Obtener estadísticas
router.get('/estadisticas', ImagenController.obtenerEstadisticas);

// Servir imagen (solo para desarrollo, en producción los archivos son temporales)
router.get('/:filename', ImagenController.servirImagen);

module.exports = router;
