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
      console.error('❌ Error en Imagen.guardar:', error);
      throw error;
    }
  }

  // Obtener todas las imágenes (con manejo de reconexión)
  static async obtenerTodas() {
    try {
      const sql = `SELECT * FROM Imagenes ORDER BY FechaSubida DESC`;
      const rows = await db.query(sql);
      return rows;
    } catch (error) {
      console.error('❌ Error en Imagen.obtenerTodas:', {
        code: error.code,
        message: error.message
      });
      
      // Lanzar error para que el controlador lo maneje
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
      console.error('❌ Error en Imagen.obtenerPorId:', error);
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
      console.error('❌ Error en Imagen.obtenerPorNombreArchivo:', error);
      throw error;
    }
  }

  // Eliminar imagen
  static async eliminar(id) {
    try {
      const sql = `DELETE FROM Imagenes WHERE Id = ?`;
      const result = await db.execute(sql, [id]);
      return result;
    } catch (error) {
      console.error('❌ Error en Imagen.eliminar:', error);
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
      console.error('❌ Error en Imagen.contar:', error);
      throw error;
    }
  }
}

module.exports = Imagen;
