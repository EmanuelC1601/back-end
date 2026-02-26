// routes/mensajes.js
const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');

router.post('/', mensajeController.create);
router.get('/', mensajeController.findAll);
router.get('/:id', mensajeController.findOne);
router.put('/:id', mensajeController.update);
router.delete('/:id', mensajeController.delete);

module.exports = router;