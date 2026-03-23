// routes/uploadRoutes.js  ← ARCHIVO FALTANTE, se crea completo
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const Usuario = require('../models/usuarioModel');

// Configurar directorio de uploads según entorno
const uploadsDir = process.env.NODE_ENV === 'production'
    ? '/tmp/uploads'
    : path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `usuario_${req.params.id}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo imágenes (jpg, png, gif, webp).'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/upload/usuario/:id
router.post('/usuario/:id', authMiddleware, upload.single('imagen'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
        }

        const id = req.params.id;
        const usuario = await Usuario.getById(id);
        if (!usuario) {
            // Eliminar archivo subido si el usuario no existe
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Eliminar imagen anterior si existía
        if (usuario.strImagen) {
            const oldPath = path.join(uploadsDir, path.basename(usuario.strImagen));
            if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); } catch (e) { /* ignorar */ }
            }
        }

        const rutaRelativa = `/uploads/${req.file.filename}`;
        await Usuario.updateImagen(id, rutaRelativa);

        res.json({
            message: 'Imagen subida correctamente',
            strImagen: rutaRelativa,
            filename: req.file.filename
        });
    } catch (error) {
        next(error);
    }
});

// Manejo de errores de multer
router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'El archivo excede el tamaño máximo de 5MB' });
    }
    if (err.message.includes('Tipo de archivo')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

module.exports = router;