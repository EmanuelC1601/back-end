const Registro = require('../models/Registro');

class RegistroController {
  // Insertar datos automáticos
  static async insertarAutomatico(req, res) {
    try {
      const { usuario, password, serie } = req.body;
      
      // Validaciones básicas
      if (!usuario || !password || !serie) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos (usuario, password, serie)'
        });
      }

      if (typeof serie !== 'number' || serie < 1 || serie > 9999) {
        return res.status(400).json({
          success: false,
          message: 'La serie debe ser un número entre 1 y 9999'
        });
      }

      // Generar datos automáticos si no se proporcionan
      const usuarioFinal = usuario || `auto_user_${Date.now()}`;
      const passwordFinal = password || `auto_pass_${Math.random().toString(36).substr(2, 8)}`;
      const serieFinal = serie || Math.floor(Math.random() * 1000) + 1;

      // Insertar en base de datos
      const id = await Registro.insertarAutomatico(usuarioFinal, passwordFinal, serieFinal);
      
      res.status(201).json({
        success: true,
        message: 'Registro insertado correctamente',
        data: {
          id,
          usuario: usuarioFinal,
          serie: serieFinal,
          fechaRegistro: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error insertando registro:', error);
      
      // Verificar si es error de duplicado
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya existe'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error del servidor al insertar registro',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Registrar usuario desde formulario
  static async registrarUsuario(req, res) {
    try {
      const { usuario, fechaNacimiento, password, confirmPassword } = req.body;
      
      // Validaciones
      if (!usuario || usuario.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'El usuario debe tener al menos 3 caracteres'
        });
      }

      if (!fechaNacimiento) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de nacimiento es requerida'
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden'
        });
      }

      // Verificar si usuario ya existe
      const existe = await Registro.usuarioExiste(usuario);
      if (existe) {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya existe'
        });
      }

      // Insertar en base de datos
      const id = await Registro.registrarUsuario(usuario, fechaNacimiento, password);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        data: {
          id,
          usuario,
          fechaNacimiento,
          fechaRegistro: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error registrando usuario:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya existe'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error del servidor al registrar usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener todos los registros
  static async obtenerRegistros(req, res) {
    try {
      const registros = await Registro.obtenerTodos();
      
      res.status(200).json({
        success: true,
        data: registros,
        count: registros.length
      });
    } catch (error) {
      console.error('Error obteniendo registros:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor al obtener registros'
      });
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas(req, res) {
    try {
      const [totalRegistros, totalUsuarios] = await Promise.all([
        Registro.contar(),
        Registro.contarUsuarios()
      ]);
      
      res.status(200).json({
        success: true,
        data: {
          totalRegistros,
          totalUsuarios,
          fecha: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor al obtener estadísticas'
      });
    }
  }
}

module.exports = RegistroController;