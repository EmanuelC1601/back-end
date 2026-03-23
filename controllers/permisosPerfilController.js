// controllers/permisosPerfilController.js
const PermisosPerfil = require('../models/permisosPerfilModel');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const permisos = await PermisosPerfil.getAll(limit, offset);
        const total = await PermisosPerfil.getCount();

        res.json({
            data: permisos,
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
        const permiso = await PermisosPerfil.getById(id);
        if (!permiso) {
            return res.status(404).json({ message: 'Permiso no encontrado' });
        }
        res.json(permiso);
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

        const { idModulo, idPerfil, bitAgregar, bitEditar, bitConsulta, bitEliminar, bitDetalle } = req.body;

        // Verificar si ya existe combinación módulo-perfil
        const existe = await PermisosPerfil.exists(idModulo, idPerfil);
        if (existe) {
            return res.status(400).json({ message: 'Ya existe un registro para este módulo y perfil' });
        }

        const id = await PermisosPerfil.create({
            idModulo,
            idPerfil,
            bitAgregar,
            bitEditar,
            bitConsulta,
            bitEliminar,
            bitDetalle
        });

        res.status(201).json({ id, message: 'Permiso creado exitosamente' });
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
        const { idModulo, idPerfil, bitAgregar, bitEditar, bitConsulta, bitEliminar, bitDetalle } = req.body;

        const permiso = await PermisosPerfil.getById(id);
        if (!permiso) {
            return res.status(404).json({ message: 'Permiso no encontrado' });
        }

        // Verificar si ya existe otro con la misma combinación (excluyendo este id)
        const existe = await PermisosPerfil.exists(idModulo, idPerfil, id);
        if (existe) {
            return res.status(400).json({ message: 'Ya existe otro registro para este módulo y perfil' });
        }

        await PermisosPerfil.update(id, {
            idModulo,
            idPerfil,
            bitAgregar,
            bitEditar,
            bitConsulta,
            bitEliminar,
            bitDetalle
        });

        res.json({ message: 'Permiso actualizado correctamente' });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;

        const permiso = await PermisosPerfil.getById(id);
        if (!permiso) {
            return res.status(404).json({ message: 'Permiso no encontrado' });
        }

        await PermisosPerfil.delete(id);
        res.json({ message: 'Permiso eliminado' });
    } catch (error) {
        next(error);
    }
};

// Endpoint adicional: Obtener permisos por perfil (para el menú)
exports.getByPerfil = async (req, res, next) => {
    try {
        const idPerfil = req.params.idPerfil;
        const permisos = await PermisosPerfil.getByPerfil(idPerfil);
        res.json(permisos);
    } catch (error) {
        next(error);
    }
};