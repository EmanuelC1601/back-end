// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Login
router.post(
    '/login',
    [
        body('strNombreUsuario').notEmpty().withMessage('El usuario es requerido'),
        body('strPwd').notEmpty().withMessage('La contraseña es requerida')
        // captchaToken es opcional pero se valida en el controlador
    ],
    authController.login
);

// Verificar token (ruta protegida, pero no necesita validación extra)
const authMiddleware = require('../middleware/authMiddleware');
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;