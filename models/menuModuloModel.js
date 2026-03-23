// models/menuModuloModel.js
const db = require('./db');

const MenuModulo = {
    /**
     * Asocia un módulo a un menú
     */
    async create(data) {
        const sql = 'INSERT INTO menu_modulo (idMenu, idModulo) VALUES (?, ?)';
        return await db.insert(sql, [data.idMenu, data.idModulo]);
    },

    /**
     * Elimina una asociación
     */
    async delete(id) {
        const sql = 'DELETE FROM menu_modulo WHERE id = ?';
        return await db.delete(sql, [id]);
    },

    /**
     * Elimina todas las asociaciones de un menú
     */
    async deleteByMenu(idMenu) {
        const sql = 'DELETE FROM menu_modulo WHERE idMenu = ?';
        return await db.delete(sql, [idMenu]);
    },

    /**
     * Obtiene las asociaciones por menú
     */
    async getByMenu(idMenu) {
        const sql = 'SELECT * FROM menu_modulo WHERE idMenu = ?';
        return await db.query(sql, [idMenu]);
    },

    /**
     * Obtiene las asociaciones por módulo
     */
    async getByModulo(idModulo) {
        const sql = 'SELECT * FROM menu_modulo WHERE idModulo = ?';
        return await db.query(sql, [idModulo]);
    }
};

module.exports = MenuModulo;