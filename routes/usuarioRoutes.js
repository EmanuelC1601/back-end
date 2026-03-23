// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Obtener todos los usuarios (paginado)
router.get('/', usuarioController.getAll);

// Obtener un usuario por ID
router.get('/:id', usuarioController.getById);

// Crear un nuevo usuario
router.post(
    '/',
    [
        body('strNombreUsuario').notEmpty().withMessage('El nombre de usuario es requerido'),
        body('idPerfil').isInt({ min: 1 }).withMessage('Debe seleccionar un perfil válido'),
        body('strPwd').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('idEstadoUsuario').isBoolean().withMessage('El estado debe ser booleano'),
        body('strCorreo').isEmail().withMessage('Debe ser un correo válido'),
        body('strNumeroCelular').optional().isMobilePhone().withMessage('Número de celular inválido')
    ],
    usuarioController.create
);

// Actualizar un usuario
router.put(
    '/:id',
    [
        body('strNombreUsuario').notEmpty().withMessage('El nombre de usuario es requerido'),
        body('idPerfil').isInt({ min: 1 }).withMessage('Debe seleccionar un perfil válido'),
        body('strPwd').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('idEstadoUsuario').isBoolean().withMessage('El estado debe ser booleano'),
        body('strCorreo').isEmail().withMessage('Debe ser un correo válido'),
        body('strNumeroCelular').optional().isMobilePhone().withMessage('Número de celular inválido')
    ],
    usuarioController.update
);

// Eliminar un usuario
router.delete('/:id', usuarioController.delete);

module.exports = router;