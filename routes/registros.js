const express = require('express');
const router = express.Router();
const RegistroController = require('../controllers/registroController');

// Insertar datos automáticos
router.post('/insertar-automatico', RegistroController.insertarAutomatico);

// Registrar usuario desde formulario
router.post('/registrar-usuario', RegistroController.registrarUsuario);

// Obtener todos los registros
router.get('/obtener-registros', RegistroController.obtenerRegistros);

// Obtener estadísticas
router.get('/estadisticas', RegistroController.obtenerEstadisticas);

module.exports = router;