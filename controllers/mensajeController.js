// controllers/mensajeController.js
const Mensaje = require('../models/Mensaje');

// Validaciones
const validateInput = (nombre_completo, email, edad, mensaje) => {
    const errors = [];

    // Nombre completo: no vacío, sin caracteres especiales ni espacios múltiples
    const nameRegex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/; // permite letras y espacios
    if (!nombre_completo || nombre_completo.trim() === '') {
        errors.push('El nombre completo es obligatorio');
    } else if (!nameRegex.test(nombre_completo)) {
        errors.push('El nombre solo puede contener letras y espacios');
    }

    // Email: válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Correo electrónico no válido');
    }

    // Edad: número, entre 18 y 120
    const edadNum = parseInt(edad);
    if (isNaN(edadNum) || edadNum < 18 || edadNum > 120) {
        errors.push('La edad debe ser un número entre 18 y 120');
    }

    // Mensaje: no vacío
    if (!mensaje || mensaje.trim() === '') {
        errors.push('El mensaje no puede estar vacío');
    }

    return errors;
};

// Crear mensaje
exports.create = async (req, res) => {
    try {
        const { nombre_completo, email, edad, mensaje } = req.body;

        const errors = validateInput(nombre_completo, email, edad, mensaje);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const [result] = await Mensaje.create(nombre_completo, email, edad, mensaje);
        res.status(201).json({ id: result.insertId, message: 'Mensaje creado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Obtener todos con paginación y filtros
exports.findAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const search = req.query.search || '';
        const edadMin = req.query.edadMin ? parseInt(req.query.edadMin) : null;
        const edadMax = req.query.edadMax ? parseInt(req.query.edadMax) : null;

        const [rows] = await Mensaje.findAll(limit, offset, search, edadMin, edadMax);
        const [totalRows] = await Mensaje.count(search, edadMin, edadMax);
        const total = totalRows[0].total;

        res.json({
            data: rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Obtener uno por ID
exports.findOne = async (req, res) => {
    try {
        const [rows] = await Mensaje.findById(req.params.id);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Actualizar
exports.update = async (req, res) => {
    try {
        const { nombre_completo, email, edad, mensaje } = req.body;
        const id = req.params.id;

        const errors = validateInput(nombre_completo, email, edad, mensaje);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const [result] = await Mensaje.update(id, nombre_completo, email, edad, mensaje);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }
        res.json({ message: 'Mensaje actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Eliminar
exports.delete = async (req, res) => {
    try {
        const [result] = await Mensaje.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }
        res.json({ message: 'Mensaje eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};