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

      const { originalname, filename, mimetype, size } = req.file;
      const ruta = `/uploads/${filename}`;
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      // Guardar en base de datos
      const id = await Imagen.guardar(originalname, filename, ruta, mimetype, size);
      
      res.status(201).json({
        success: true,
        message: 'Imagen subida correctamente',
        data: {
          id,
          nombreOriginal: originalname,
          nombreArchivo: filename,
          ruta: `${baseUrl}${ruta}`,
          url: `${baseUrl}${ruta}`, // Para compatibilidad
          tipo: mimetype,
          tamaño: size,
          fechaSubida: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      
      // Si hay error, eliminar el archivo subido
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo temporal:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error del servidor al subir imagen',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener todas las imágenes
  static async obtenerImagenes(req, res) {
    try {
      const imagenes = await Imagen.obtenerTodas();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Formatear URLs completas
      const imagenesConURL = imagenes.map(img => ({
        Id: img.Id,
        id: img.Id, // Para compatibilidad con frontend
        NombreOriginal: img.NombreOriginal,
        nombreOriginal: img.NombreOriginal, // Para compatibilidad
        NombreArchivo: img.NombreArchivo,
        Ruta: img.Ruta,
        Tipo: img.Tipo,
        Tamaño: img.Tamaño,
        tamaño: img.Tamaño, // Para compatibilidad
        FechaSubida: img.FechaSubida,
        fechaSubida: img.FechaSubida, // Para compatibilidad
        url: `${baseUrl}${img.Ruta}`, // URL completa
        ruta: `${baseUrl}${img.Ruta}` // Para compatibilidad
      }));
      
      res.status(200).json({
        success: true,
        data: imagenesConURL,
        count: imagenesConURL.length
      });
    } catch (error) {
      console.error('Error obteniendo imágenes:', error);
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

      // Eliminar archivo físico
      const filePath = path.join(__dirname, '..', 'uploads', imagen.NombreArchivo);
      if (fsSync.existsSync(filePath)) {
        await fs.unlink(filePath);
      }

      // Eliminar de base de datos
      await Imagen.eliminar(imagen.Id);
      
      res.status(200).json({
        success: true,
        message: 'Imagen eliminada correctamente'
      });
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor al eliminar imagen'
      });
    }
  }

  // Servir imagen
  static async servirImagen(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      
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
        
        res.status(404).json({
          success: false,
          message: 'Archivo de imagen no encontrado en el servidor',
          imagen: imagen
        });
      }
    } catch (error) {
      console.error('Error sirviendo imagen:', error);
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
      console.error('Error obteniendo estadísticas de imágenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor al obtener estadísticas'
      });
    }
  }
}

module.exports = ImagenController;