const Imagen = require('../models/Imagen');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

class ImagenController {
  // Subir imagen
  static async subirImagen(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha seleccionado ninguna imagen'
        });
      }

      const { originalname, filename, mimetype, size, path: filePath } = req.file;
      
      // Determinar ruta según entorno
      const ruta = process.env.NODE_ENV === 'production'
        ? `/tmp/uploads/${filename}`  // Ruta temporal en Render
        : `/uploads/${filename}`;
      
      // Determinar URL base según entorno
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://backend-bhit.onrender.com'
        : `${req.protocol}://${req.get('host')}`;

      console.log('📤 Intentando guardar imagen en BD:', {
        originalname,
        filename,
        mimetype,
        size,
        filePath
      });

      // Guardar en base de datos
      const id = await Imagen.guardar(originalname, filename, ruta, mimetype, size);
      
      console.log('✅ Imagen guardada en BD con ID:', id);
      
      res.status(201).json({
        success: true,
        message: 'Imagen subida correctamente',
        data: {
          id,
          nombreOriginal: originalname,
          nombreArchivo: filename,
          ruta: `${baseUrl}${ruta}`,
          url: `${baseUrl}${ruta}`,
          tipo: mimetype,
          tamaño: size,
          fechaSubida: new Date().toISOString()
        },
        warning: process.env.NODE_ENV === 'production'
          ? 'Las imágenes son temporales y se perderán al reiniciar el servidor'
          : undefined
      });
    } catch (error) {
      console.error('❌ Error completo subiendo imagen:', {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
      
      // Si hay error, eliminar el archivo subido
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
          console.log('🗑️ Archivo temporal eliminado:', req.file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo temporal:', unlinkError);
        }
      }

      // Manejar errores específicos
      let statusCode = 500;
      let errorMessage = 'Error del servidor al subir imagen';
      
      if (error.code === 'ECONNRESET') {
        statusCode = 503;
        errorMessage = 'Error de conexión con la base de datos. Intenta nuevamente.';
      } else if (error.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        errorMessage = 'La imagen ya existe en la base de datos';
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener todas las imágenes (CON MANEJO DE ERROR ECONNRESET)
  static async obtenerImagenes(req, res) {
    try {
      console.log('📥 Intentando obtener imágenes de la BD...');
      const imagenes = await Imagen.obtenerTodas();
      console.log(`✅ ${imagenes.length} imágenes obtenidas`);
      
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://backend-bhit.onrender.com'
        : `${req.protocol}://${req.get('host')}`;
      
      // Formatear URLs completas
      const imagenesConURL = imagenes.map(img => ({
        id: img.Id,
        nombreOriginal: img.NombreOriginal,
        nombreArchivo: img.NombreArchivo,
        ruta: img.Ruta,
        tipo: img.Tipo,
        tamaño: img.Tamaño,
        fechaSubida: img.FechaSubida,
        url: `${baseUrl}/uploads/${img.NombreArchivo}`
      }));
      
      res.status(200).json({
        success: true,
        data: imagenesConURL,
        count: imagenesConURL.length,
        warning: process.env.NODE_ENV === 'production'
          ? 'Las imágenes son temporales y pueden no estar disponibles'
          : undefined
      });
    } catch (error) {
      console.error('❌ Error obteniendo imágenes:', {
        message: error.message,
        code: error.code
      });
      
      // Manejar error de conexión específicamente
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.status(503).json({
          success: false,
          message: 'Error temporal de conexión con la base de datos',
          suggestion: 'Intenta nuevamente en unos segundos',
          retryAfter: 5
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error del servidor al obtener imágenes'
      });
    }
  }

  // Eliminar imagen
  static async eliminarImagen(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de imagen no válido'
        });
      }

      // Obtener información de la imagen
      const imagen = await Imagen.obtenerPorId(parseInt(id));
      if (!imagen) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      // Eliminar archivo físico (si existe)
      const filePath = process.env.NODE_ENV === 'production'
        ? `/tmp/uploads/${imagen.NombreArchivo}`
        : path.join(__dirname, '..', 'uploads', imagen.NombreArchivo);
      
      if (fsSync.existsSync(filePath)) {
        await fs.unlink(filePath);
        console.log('🗑️ Archivo eliminado:', filePath);
      } else {
        console.log('⚠️ Archivo no encontrado:', filePath);
      }

      // Eliminar de base de datos
      await Imagen.eliminar(imagen.Id);
      
      res.status(200).json({
        success: true,
        message: 'Imagen eliminada correctamente'
      });
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor al eliminar imagen'
      });
    }
  }

  // Servir imagen (solo para desarrollo)
  static async servirImagen(req, res) {
    try {
      const { filename } = req.params;
      
      // Determinar ruta según entorno
      const filePath = process.env.NODE_ENV === 'production'
        ? `/tmp/uploads/${filename}`
        : path.join(__dirname, '..', 'uploads', filename);
      
      if (fsSync.existsSync(filePath)) {
        // Configurar headers para caché
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(filePath);
      } else {
        // Verificar en base de datos
        const imagen = await Imagen.obtenerPorNombreArchivo(filename);
        if (!imagen) {
          return res.status(404).json({
            success: false,
            message: 'Imagen no encontrada'
          });
        }
        
        // Si está en BD pero no en filesystem (común en producción)
        res.status(410).json({
          success: false,
          message: 'Archivo de imagen no disponible',
          imagen: {
            ...imagen,
            warning: process.env.NODE_ENV === 'production'
              ? 'En plan Free, los archivos se pierden al reiniciar el servidor'
              : 'El archivo fue eliminado del servidor'
          }
        });
      }
    } catch (error) {
      console.error('❌ Error sirviendo imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor al servir imagen'
      });
    }
  }

  // Obtener estadísticas de imágenes
  static async obtenerEstadisticas(req, res) {
    try {
      const totalImagenes = await Imagen.contar();
      const imagenes = await Imagen.obtenerTodas();
      
      // Calcular tamaño total
      const tamañoTotal = imagenes.reduce((total, img) => total + (img.Tamaño || 0), 0);
      const tamañoTotalMB = (tamañoTotal / (1024 * 1024)).toFixed(2);
      
      res.status(200).json({
        success: true,
        data: {
          totalImagenes,
          tamañoTotal: tamañoTotalMB + ' MB',
          ultimaSubida: imagenes[0]?.FechaSubida || null
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de imágenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor al obtener estadísticas'
      });
    }
  }
}

module.exports = ImagenController;
