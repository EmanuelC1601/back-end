// models/permisosPerfilModel.js
const db = require('./db');

const PermisosPerfil = {
    /**
     * Obtiene todos los permisos con paginación (con nombres de perfil y módulo)
     */
    async getAll(limit = 5, offset = 0) {
        const sql = `
            SELECT pp.*, 
                   p.strNombrePerfil, 
                   m.strNombreModulo 
            FROM permisosperfil pp
            INNER JOIN perfil p ON pp.idPerfil = p.id
            INNER JOIN modulo m ON pp.idModulo = m.id
            ORDER BY p.strNombrePerfil, m.strNombreModulo
            LIMIT ? OFFSET ?
        `;
        return await db.query(sql, [limit, offset]);
    },

    /**
     * Cuenta el total de permisos
     */
    async getCount() {
        const sql = 'SELECT COUNT(*) as total FROM permisosperfil';
        const result = await db.getOne(sql);
        return result.total;
    },

    /**
     * Obtiene un permiso por ID
     */
    async getById(id) {
        const sql = `
            SELECT pp.*, 
                   p.strNombrePerfil, 
                   m.strNombreModulo 
            FROM permisosperfil pp
            INNER JOIN perfil p ON pp.idPerfil = p.id
            INNER JOIN modulo m ON pp.idModulo = m.id
            WHERE pp.id = ?
        `;
        return await db.getOne(sql, [id]);
    },

    /**
     * Obtiene todos los permisos de un perfil específico (para el menú y edición)
     */
    async getByPerfil(idPerfil) {
        const sql = `
            SELECT pp.*, 
                   p.strNombrePerfil, 
                   m.strNombreModulo 
            FROM permisosperfil pp
            INNER JOIN perfil p ON pp.idPerfil = p.id
            INNER JOIN modulo m ON pp.idModulo = m.id
            WHERE pp.idPerfil = ?
            ORDER BY m.strNombreModulo
        `;
        return await db.query(sql, [idPerfil]);
    },

    /**
     * Verifica si existe una combinación módulo-perfil
     * @param {number} idModulo - ID del módulo
     * @param {number} idPerfil - ID del perfil
     * @param {number} excludeId - ID a excluir (para actualización)
     */
    async exists(idModulo, idPerfil, excludeId = null) {
        let sql = 'SELECT id FROM permisosperfil WHERE idModulo = ? AND idPerfil = ?';
        let params = [idModulo, idPerfil];
        
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        
        const result = await db.getOne(sql, params);
        return !!result;
    },

    /**
     * Crea un nuevo permiso
     */
    async create(data) {
        const sql = `
            INSERT INTO permisosperfil 
            (idModulo, idPerfil, bitAgregar, bitEditar, bitConsulta, bitEliminar, bitDetalle) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return await db.insert(sql, [
            data.idModulo,
            data.idPerfil,
            data.bitAgregar || false,
            data.bitEditar || false,
            data.bitConsulta || false,
            data.bitEliminar || false,
            data.bitDetalle || false
        ]);
    },

    /**
     * Actualiza un permiso existente
     */
    async update(id, data) {
        const sql = `
            UPDATE permisosperfil 
            SET idModulo = ?, 
                idPerfil = ?, 
                bitAgregar = ?, 
                bitEditar = ?, 
                bitConsulta = ?, 
                bitEliminar = ?, 
                bitDetalle = ?
            WHERE id = ?
        `;
        return await db.update(sql, [
            data.idModulo,
            data.idPerfil,
            data.bitAgregar || false,
            data.bitEditar || false,
            data.bitConsulta || false,
            data.bitEliminar || false,
            data.bitDetalle || false,
            id
        ]);
    },

    /**
     * Elimina un permiso por ID
     */
    async delete(id) {
        const sql = 'DELETE FROM permisosperfil WHERE id = ?';
        return await db.delete(sql, [id]);
    }
};

module.exports = PermisosPerfil;