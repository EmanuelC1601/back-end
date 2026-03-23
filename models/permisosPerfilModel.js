// models/permisosPerfilModel.js
// CORRECCIÓN: agregado método exists() que faltaba y era requerido por el controller
const db = require('./db');

const PermisosPerfil = {
    async getAll(limit = 5, offset = 0) {
        const sql = `
            SELECT pp.*, m.strNombreModulo, p.strNombrePerfil
            FROM permisosperfil pp
            INNER JOIN modulo m ON pp.idModulo = m.id
            INNER JOIN perfil p ON pp.idPerfil = p.id
            LIMIT ? OFFSET ?
        `;
        return await db.query(sql, [limit, offset]);
    },

    async getCount() {
        const sql = 'SELECT COUNT(*) as total FROM permisosperfil';
        const result = await db.getOne(sql);
        return result.total;
    },

    async getById(id) {
        const sql = `
            SELECT pp.*, m.strNombreModulo, p.strNombrePerfil
            FROM permisosperfil pp
            INNER JOIN modulo m ON pp.idModulo = m.id
            INNER JOIN perfil p ON pp.idPerfil = p.id
            WHERE pp.id = ?
        `;
        return await db.getOne(sql, [id]);
    },

    async getByPerfil(idPerfil) {
        const sql = `
            SELECT pp.*, m.strNombreModulo
            FROM permisosperfil pp
            INNER JOIN modulo m ON pp.idModulo = m.id
            WHERE pp.idPerfil = ?
        `;
        return await db.query(sql, [idPerfil]);
    },

    // ← MÉTODO AGREGADO: faltaba y el controller lo invocaba
    async exists(idModulo, idPerfil, excludeId = null) {
        let sql = 'SELECT id FROM permisosperfil WHERE idModulo = ? AND idPerfil = ?';
        const params = [idModulo, idPerfil];
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        const row = await db.getOne(sql, params);
        return !!row;
    },

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

    async update(id, data) {
        const sql = `
            UPDATE permisosperfil SET 
            idModulo = ?, idPerfil = ?,
            bitAgregar = ?, bitEditar = ?, bitConsulta = ?, 
            bitEliminar = ?, bitDetalle = ? 
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

    async delete(id) {
        const sql = 'DELETE FROM permisosperfil WHERE id = ?';
        return await db.delete(sql, [id]);
    },

    async getByModuloAndPerfil(idModulo, idPerfil) {
        const sql = 'SELECT * FROM permisosperfil WHERE idModulo = ? AND idPerfil = ?';
        return await db.getOne(sql, [idModulo, idPerfil]);
    },

    async getPermisosPorPerfil(idPerfil) {
        const sql = `
            SELECT m.id as idModulo, m.strNombreModulo, 
                   COALESCE(pp.bitAgregar, 0) as bitAgregar,
                   COALESCE(pp.bitEditar, 0) as bitEditar,
                   COALESCE(pp.bitConsulta, 0) as bitConsulta,
                   COALESCE(pp.bitEliminar, 0) as bitEliminar,
                   COALESCE(pp.bitDetalle, 0) as bitDetalle
            FROM modulo m
            LEFT JOIN permisosperfil pp ON m.id = pp.idModulo AND pp.idPerfil = ?
            ORDER BY m.strNombreModulo
        `;
        return await db.query(sql, [idPerfil]);
    }
};

module.exports = PermisosPerfil;