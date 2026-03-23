// routes/moduloRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const moduloController = require('../controllers/moduloController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Obtener todos los módulos (paginado)
router.get('/', moduloController.getAll);

// Obtener un módulo por ID
router.get('/:id', moduloController.getById);

// Crear un nuevo módulo
router.post(
    '/',
    [
        body('strNombreModulo').notEmpty().withMessage('El nombre del módulo es requerido')
    ],
    moduloController.create
);

// Actualizar un módulo
router.put(
    '/:id',
    [
        body('strNombreModulo').notEmpty().withMessage('El nombre del módulo es requerido')
    ],
    moduloController.update
);

// Eliminar un módulo
router.delete('/:id', moduloController.delete);

module.exports = router;