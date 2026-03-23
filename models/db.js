// models/db.js
const pool = require('../config/database');

module.exports = {
    /**
     * Ejecuta una consulta SQL con parámetros
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros para la consulta
     * @returns {Promise<Array>} - Resultado de la consulta
     */
    async query(sql, params) {
        const [rows] = await pool.execute(sql, params);
        return rows;
    },

    /**
     * Obtiene una sola fila
     */
    async getOne(sql, params) {
        const rows = await this.query(sql, params);
        return rows[0];
    },

    /**
     * Inserta un registro y devuelve el ID insertado
     */
    async insert(sql, params) {
        const [result] = await pool.execute(sql, params);
        return result.insertId;
    },

    /**
     * Actualiza registros y devuelve el número de filas afectadas
     */
    async update(sql, params) {
        const [result] = await pool.execute(sql, params);
        return result.affectedRows;
    },

    /**
     * Elimina registros y devuelve el número de filas afectadas
     */
    async delete(sql, params) {
        const [result] = await pool.execute(sql, params);
        return result.affectedRows;
    }
};