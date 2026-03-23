// controllers/moduloController.js
const Modulo = require('../models/moduloModel');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const modulos = await Modulo.getAll(limit, offset);
        const total = await Modulo.getCount();

        res.json({
            data: modulos,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const modulo = await Modulo.getById(id);
        if (!modulo) {
            return res.status(404).json({ message: 'Módulo no encontrado' });
        }
        res.json(modulo);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { strNombreModulo } = req.body;
        const id = await Modulo.create({ strNombreModulo });
        res.status(201).json({ id, message: 'Módulo creado exitosamente' });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;
        const { strNombreModulo } = req.body;

        const modulo = await Modulo.getById(id);
        if (!modulo) {
            return res.status(404).json({ message: 'Módulo no encontrado' });
        }

        await Modulo.update(id, { strNombreModulo });
        res.json({ message: 'Módulo actualizado correctamente' });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;

        const modulo = await Modulo.getById(id);
        if (!modulo) {
            return res.status(404).json({ message: 'Módulo no encontrado' });
        }

        await Modulo.delete(id);
        res.json({ message: 'Módulo eliminado' });
    } catch (error) {
        // Si hay error de llave foránea
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'No se puede eliminar porque hay permisos asociados a este módulo' });
        }
        next(error);
    }
};