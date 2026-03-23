// routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Obtener el menú dinámico para el usuario autenticado
router.get('/', menuController.getMenuByUser);

module.exports = router;