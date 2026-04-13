// models/perfilModel.js
const db = require('./db');

const Perfil = {
    /**
     * Obtiene todos los perfiles con paginación
     * @param {number} limit - Número de registros por página
     * @param {number} offset - Desplazamiento
     * @returns {Promise<Array>}
     */
    async getAll(limit = 5, offset = 0) {
        const sql = 'SELECT * FROM perfil ORDER BY id LIMIT ? OFFSET ?';
        return await db.query(sql, [limit, offset]);
    },

    /**
     * Cuenta el total de perfiles
     */
    async getCount() {
        const sql = 'SELECT COUNT(*) as total FROM perfil';
        const result = await db.getOne(sql);
        return result.total;
    },

    /**
     * Obtiene un perfil por ID
     */
    async getById(id) {
        const sql = 'SELECT * FROM perfil WHERE id = ?';
        return await db.getOne(sql, [id]);
    },

    /**
     * Crea un nuevo perfil
     * @param {Object} data - { strNombrePerfil, bitAdministrador, strDescripcion }
     * @returns {Promise<number>} - ID insertado
     */
    async create(data) {
        const sql = 'INSERT INTO perfil (strNombrePerfil, bitAdministrador, strDescripcion) VALUES (?, ?, ?)';
        return await db.insert(sql, [
            data.strNombrePerfil, 
            data.bitAdministrador || false,
            data.strDescripcion || null
        ]);
    },

    /**
     * Actualiza un perfil existente
     */
    async update(id, data) {
        const sql = 'UPDATE perfil SET strNombrePerfil = ?, bitAdministrador = ?, strDescripcion = ? WHERE id = ?';
        return await db.update(sql, [
            data.strNombrePerfil, 
            data.bitAdministrador,
            data.strDescripcion || null,
            id
        ]);
    },

    /**
     * Elimina un perfil por ID
     */
    async delete(id) {
        const sql = 'DELETE FROM perfil WHERE id = ?';
        return await db.delete(sql, [id]);
    }
};

module.exports = Perfil;