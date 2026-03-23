// controllers/menuController.js
// CORRECCIÓN: db.query() del modelo ya retorna el array directamente (no [rows])
const PermisosPerfil = require('../models/permisosPerfilModel');

exports.getMenuByUser = async (req, res, next) => {
    try {
        const idPerfil = req.usuario.idPerfil;

        // Obtener permisos del perfil (usa el modelo ya corregido)
        const permisos = await PermisosPerfil.getByPerfil(idPerfil);

        // Filtrar solo los módulos con al menos un bit en true
        const modulosConPermiso = permisos.filter(p =>
            p.bitAgregar || p.bitEditar || p.bitConsulta || p.bitEliminar || p.bitDetalle
        );

        if (modulosConPermiso.length === 0) {
            return res.json([]);
        }

        // Construir el árbol de menú estático + dinámico
        // Los módulos de seguridad se mapean al menú "Seguridad"
        const modulosIds = modulosConPermiso.map(m => m.idModulo);

        // Responder con la estructura de menú dinámica
        // Basado en la estructura definida en el proyecto
        const menuCompleto = buildMenuFromModules(modulosConPermiso);
        res.json(menuCompleto);

    } catch (error) {
        next(error);
    }
};

/**
 * Construye el menú dinámico basado en los permisos
 * Los nombres de módulos en BD deben coincidir con estos identificadores
 */
function buildMenuFromModules(permisos) {
    // Retornar los permisos con info del módulo para que el frontend construya el menú
    return permisos.map(p => ({
        idModulo: p.idModulo,
        strNombreModulo: p.strNombreModulo,
        bitAgregar: !!p.bitAgregar,
        bitEditar: !!p.bitEditar,
        bitConsulta: !!p.bitConsulta,
        bitEliminar: !!p.bitEliminar,
        bitDetalle: !!p.bitDetalle
    }));
}