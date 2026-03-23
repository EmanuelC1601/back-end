// models/moduloModel.js
const db = require('./db');

const Modulo = {
    /**
     * Obtiene todos los módulos con paginación
     */
    async getAll(limit = 5, offset = 0) {
        const sql = 'SELECT * FROM modulo LIMIT ? OFFSET ?';
        return await db.query(sql, [limit, offset]);
    },

    /**
     * Cuenta total de módulos
     */
    async getCount() {
        const sql = 'SELECT COUNT(*) as total FROM modulo';
        const result = await db.getOne(sql);
        return result.total;
    },

    /**
     * Obtiene un módulo por ID
     */
    async getById(id) {
        const sql = 'SELECT * FROM modulo WHERE id = ?';
        return await db.getOne(sql, [id]);
    },

    /**
     * Crea un nuevo módulo
     */
    async create(data) {
        const sql = 'INSERT INTO modulo (strNombreModulo) VALUES (?)';
        return await db.insert(sql, [data.strNombreModulo]);
    },

    /**
     * Actualiza un módulo
     */
    async update(id, data) {
        const sql = 'UPDATE modulo SET strNombreModulo = ? WHERE id = ?';
        return await db.update(sql, [data.strNombreModulo, id]);
    },

    /**
     * Elimina un módulo
     */
    async delete(id) {
        const sql = 'DELETE FROM modulo WHERE id = ?';
        return await db.delete(sql, [id]);
    },

    /**
     * Obtiene todos los módulos (sin paginación, para selects)
     */
    async getAllSimple() {
        const sql = 'SELECT id, strNombreModulo FROM modulo ORDER BY strNombreModulo';
        return await db.query(sql);
    }
};

module.exports = Modulo;