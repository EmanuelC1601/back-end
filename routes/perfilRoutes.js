// routes/perfilRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const perfilController = require('../controllers/perfilController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas de perfiles requieren autenticación
router.use(authMiddleware);

// Obtener todos los perfiles (con paginación)
router.get('/', perfilController.getAll);

// Obtener un perfil por ID
router.get('/:id', perfilController.getById);

// Crear un nuevo perfil
router.post(
    '/',
    [
        body('strNombrePerfil').notEmpty().withMessage('El nombre del perfil es requerido'),
        body('bitAdministrador').isBoolean().withMessage('bitAdministrador debe ser booleano'),
        body('strDescripcion').optional().isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres')
    ],
    perfilController.create
);

// Actualizar un perfil
router.put(
    '/:id',
    [
        body('strNombrePerfil').notEmpty().withMessage('El nombre del perfil es requerido'),
        body('bitAdministrador').isBoolean().withMessage('bitAdministrador debe ser booleano'),
        body('strDescripcion').optional().isLength({ max: 255 }).withMessage('La descripción no puede exceder 255 caracteres')
    ],
    perfilController.update
);

// Eliminar un perfil
router.delete('/:id', perfilController.delete);

module.exports = router;