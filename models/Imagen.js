const db = require('../config/database');

class Imagen {
  // Guardar información de imagen
  static async guardar(nombreOriginal, nombreArchivo, ruta, tipo, tamaño) {
    try {
      const sql = `INSERT INTO Imagenes (NombreOriginal, NombreArchivo, Ruta, Tipo, Tamaño) 
                   VALUES (?, ?, ?, ?, ?)`;
      const result = await db.execute(sql, [nombreOriginal, nombreArchivo, ruta, tipo, tamaño]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las imágenes
  static async obtenerTodas() {
    try {
      const sql = `SELECT * FROM Imagenes ORDER BY FechaSubida DESC`;
      return await db.query(sql);
    } catch (error) {
      throw error;
    }
  }

  // Obtener imagen por ID
  static async obtenerPorId(id) {
    try {
      const sql = `SELECT * FROM Imagenes WHERE Id = ?`;
      const rows = await db.query(sql, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener imagen por nombre de archivo
  static async obtenerPorNombreArchivo(nombreArchivo) {
    try {
      const sql = `SELECT * FROM Imagenes WHERE NombreArchivo = ?`;
      const rows = await db.query(sql, [nombreArchivo]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar imagen
  static async eliminar(id) {
    try {
      const sql = `DELETE FROM Imagenes WHERE Id = ?`;
      return await db.execute(sql, [id]);
    } catch (error) {
      throw error;
    }
  }

  // Contar imágenes
  static async contar() {
    try {
      const sql = `SELECT COUNT(*) as total FROM Imagenes`;
      const rows = await db.query(sql);
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Imagen;