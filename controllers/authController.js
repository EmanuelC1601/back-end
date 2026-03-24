const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

// ⚠️ Node 18+ ya tiene fetch nativo (Render lo soporta)

exports.login = async (req, res, next) => {
  try {
    const { strNombreUsuario, strPwd, captchaToken } = req.body;

    // 🔹 Validación básica
    if (!strNombreUsuario || !strPwd) {
      return res.status(400).json({
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // 🔐 CAPTCHA SOLO EN PRODUCCIÓN
    if (process.env.NODE_ENV === 'production') {
      if (!captchaToken) {
        return res.status(400).json({
          message: 'Captcha requerido'
        });
      }

      const secretKey = process.env.RECAPTCHA_SECRET_KEY;

      const response = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `secret=${secretKey}&response=${captchaToken}`
        }
      );

      const captchaData = await response.json();

      if (!captchaData.success) {
        return res.status(400).json({
          message: 'Captcha inválido',
          error: captchaData['error-codes']
        });
      }
    }

    // 🔍 Buscar usuario
    const usuario = await Usuario.getByUsername(strNombreUsuario);

    if (!usuario) {
      return res.status(401).json({
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // 🔒 Validar estado
    if (!usuario.idEstadoUsuario) {
      return res.status(401).json({
        message: 'Usuario inactivo'
      });
    }

    // 🔑 Validar contraseña
    const match = await bcrypt.compare(strPwd, usuario.strPwd);

    if (!match) {
      return res.status(401).json({
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // 🎟️ Generar JWT
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

    // 📦 Respuesta
    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.strNombreUsuario,
        idPerfil: usuario.idPerfil,
        strImagen: usuario.strImagen || null
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    next(error);
  }
};

// ✅ Verificar token (útil para guards)
exports.verifyToken = (req, res) => {
  res.json({
    usuario: req.usuario
  });
};
