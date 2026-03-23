// controllers/authController.js
// CORRECCIÓN: eliminado axios (no instalado), reemplazado con fetch nativo de Node 18+
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

exports.login = async (req, res, next) => {
    try {
        const { strNombreUsuario, strPwd, captchaToken } = req.body;

        if (!strNombreUsuario || !strPwd) {
            return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
        }

        // Verificar captcha con fetch nativo (Node 18+)
        if (captchaToken) {
            const secretKey = process.env.RECAPTCHA_SECRET_KEY;
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
            const captchaRes = await fetch(verifyUrl, { method: 'POST' });
            const captchaData = await captchaRes.json();
            if (!captchaData.success) {
                return res.status(400).json({ message: 'Captcha inválido. Por favor verifica que no eres un robot.' });
            }
        }

        const usuario = await Usuario.getByUsername(strNombreUsuario);
        if (!usuario) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        if (!usuario.idEstadoUsuario) {
            return res.status(401).json({ message: 'Usuario inactivo. Contacta al administrador.' });
        }

        const match = await bcrypt.compare(strPwd, usuario.strPwd);
        if (!match) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                idPerfil: usuario.idPerfil,
                nombre: usuario.strNombreUsuario,
                strImagen: usuario.strImagen || null
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.strNombreUsuario,
                idPerfil: usuario.idPerfil,
                strImagen: usuario.strImagen || null
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyToken = async (req, res) => {
    res.json({ usuario: req.usuario });
};