const db = require('../config/database');

class Registro {
  // Insertar registro automático
  static async insertarAutomatico(usuario, password, serie) {
    try {
      const sql = `INSERT INTO Registros (Usuario, Password, Serie) VALUES (?, ?, ?)`;
      const result = await db.execute(sql, [usuario, password, serie]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Registrar usuario desde formulario
  static async registrarUsuario(usuario, fechaNacimiento, password) {
    try {
      const sql = `INSERT INTO Usuarios (Usuario, FechaNacimiento, Password) VALUES (?, ?, ?)`;
      const result = await db.execute(sql, [usuario, fechaNacimiento, password]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los registros automáticos
  static async obtenerTodos() {
    try {
      const sql = `SELECT * FROM Registros ORDER BY FechaRegistro DESC`;
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios registrados
  static async obtenerTodosUsuarios() {
    try {
      const sql = `SELECT * FROM Usuarios ORDER BY FechaRegistro DESC`;
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  // Verificar si usuario existe
  static async usuarioExiste(usuario) {
    try {
      const sql = `SELECT COUNT(*) as count FROM Usuarios WHERE Usuario = ?`;
      const rows = await db.query(sql, [usuario]);
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Contar registros totales
  static async contar() {
    try {
      const sql = `SELECT COUNT(*) as total FROM Registros`;
      const rows = await db.query(sql);
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Contar usuarios totales
  static async contarUsuarios() {
    try {
      const sql = `SELECT COUNT(*) as total FROM Usuarios`;
      const rows = await db.query(sql);
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Registro;