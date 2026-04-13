// controllers/perfilController.js
const Perfil = require('../models/perfilModel');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const perfiles = await Perfil.getAll(limit, offset);
        const total = await Perfil.getCount();

        res.json({
            data: perfiles,
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
        const perfil = await Perfil.getById(id);
        if (!perfil) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }
        res.json(perfil);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        // Validar campos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { strNombrePerfil, bitAdministrador, strDescripcion } = req.body;
        
        const id = await Perfil.create({ 
            strNombrePerfil, 
            bitAdministrador,
            strDescripcion 
        });
        
        res.status(201).json({ id, message: 'Perfil creado exitosamente' });
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
        const { strNombrePerfil, bitAdministrador, strDescripcion } = req.body;

        // Verificar si existe
        const perfil = await Perfil.getById(id);
        if (!perfil) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }

        await Perfil.update(id, { 
            strNombrePerfil, 
            bitAdministrador,
            strDescripcion 
        });
        
        res.json({ message: 'Perfil actualizado correctamente' });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;

        // Verificar si existe
        const perfil = await Perfil.getById(id);
        if (!perfil) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }

        await Perfil.delete(id);
        res.json({ message: 'Perfil eliminado' });
    } catch (error) {
        // Si hay error de llave foránea, enviar mensaje amigable
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'No se puede eliminar porque hay usuarios asociados a este perfil' });
        }
        next(error);
    }
};