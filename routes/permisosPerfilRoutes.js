// routes/permisosPerfilRoutes.js
// CORRECCIÓN: ruta /perfil/:idPerfil debe ir ANTES de /:id para evitar conflicto
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const permisosPerfilController = require('../controllers/permisosPerfilController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// IMPORTANTE: Esta ruta debe ir ANTES de /:id
router.get('/perfil/:idPerfil', permisosPerfilController.getByPerfil);

// Obtener todos (paginado)
router.get('/', permisosPerfilController.getAll);

// Obtener por ID
router.get('/:id', permisosPerfilController.getById);

// Crear
router.post('/', [
    body('idModulo').isInt({ min: 1 }).withMessage('Módulo inválido'),
    body('idPerfil').isInt({ min: 1 }).withMessage('Perfil inválido'),
    body('bitAgregar').isBoolean().withMessage('Debe ser booleano'),
    body('bitEditar').isBoolean().withMessage('Debe ser booleano'),
    body('bitConsulta').isBoolean().withMessage('Debe ser booleano'),
    body('bitEliminar').isBoolean().withMessage('Debe ser booleano'),
    body('bitDetalle').isBoolean().withMessage('Debe ser booleano')
], permisosPerfilController.create);

// Actualizar
router.put('/:id', [
    body('idModulo').isInt({ min: 1 }).withMessage('Módulo inválido'),
    body('idPerfil').isInt({ min: 1 }).withMessage('Perfil inválido'),
    body('bitAgregar').isBoolean().withMessage('Debe ser booleano'),
    body('bitEditar').isBoolean().withMessage('Debe ser booleano'),
    body('bitConsulta').isBoolean().withMessage('Debe ser booleano'),
    body('bitEliminar').isBoolean().withMessage('Debe ser booleano'),
    body('bitDetalle').isBoolean().withMessage('Debe ser booleano')
], permisosPerfilController.update);

// Eliminar
router.delete('/:id', permisosPerfilController.delete);

module.exports = router;