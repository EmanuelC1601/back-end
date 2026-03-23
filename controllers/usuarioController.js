const bcrypt  = require('bcrypt');
const Usuario = require('../models/usuarioModel');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res, next) => {
    try {
        const page   = parseInt(req.query.page) || 1;
        const limit  = 5;
        const offset = (page - 1) * limit;

        const usuarios = await Usuario.getAll(limit, offset);
        const total    = await Usuario.getCount();

        res.json({
            data:  usuarios,
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
        const usuario = await Usuario.getById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(usuario);
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

        const {
            strNombreUsuario,
            idPerfil,
            strPwd,
            idEstadoUsuario,
            strCorreo,
            strNumeroCelular
        } = req.body;

        const existente = await Usuario.getByUsername(strNombreUsuario);
        if (existente) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }

        const hashedPwd = await bcrypt.hash(strPwd, 10);

        const id = await Usuario.create({
            strNombreUsuario,
            idPerfil,
            strPwd:          hashedPwd,
            idEstadoUsuario: idEstadoUsuario !== undefined ? idEstadoUsuario : true,
            strCorreo,
            strNumeroCelular: strNumeroCelular || null
        });

        res.status(201).json({ id, message: 'Usuario creado exitosamente' });
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
        const {
            strNombreUsuario,
            idPerfil,
            strPwd,
            idEstadoUsuario,
            strCorreo,
            strNumeroCelular
        } = req.body;

        const usuario = await Usuario.getById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (strNombreUsuario !== usuario.strNombreUsuario) {
            const existente = await Usuario.getByUsername(strNombreUsuario);
            if (existente) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
            }
        }

        let pwdParaGuardar = undefined;
        if (strPwd) {
            pwdParaGuardar = await bcrypt.hash(strPwd, 10);
        }

        await Usuario.update(id, {
            strNombreUsuario,
            idPerfil,
            strPwd:          pwdParaGuardar,
            idEstadoUsuario,
            strCorreo,
            strNumeroCelular: strNumeroCelular || null
        });

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id      = req.params.id;
        const usuario = await Usuario.getById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        await Usuario.delete(id);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        next(error);
    }
};