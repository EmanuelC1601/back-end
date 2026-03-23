// models/menuModel.js
const db = require('./db');

const Menu = {
    /**
     * Obtiene todos los menús con sus relaciones (para construcción de árbol)
     */
    async getAll() {
        const sql = 'SELECT * FROM menu ORDER BY orden';
        return await db.query(sql);
    },

    /**
     * Obtiene un menú por ID
     */
    async getById(id) {
        const sql = 'SELECT * FROM menu WHERE id = ?';
        return await db.getOne(sql, [id]);
    },

    /**
     * Crea un nuevo menú
     */
    async create(data) {
        const sql = 'INSERT INTO menu (strNombreMenu, idPadre, strRuta, orden) VALUES (?, ?, ?, ?)';
        return await db.insert(sql, [data.strNombreMenu, data.idPadre || null, data.strRuta || null, data.orden || 0]);
    },

    /**
     * Actualiza un menú
     */
    async update(id, data) {
        const sql = 'UPDATE menu SET strNombreMenu = ?, idPadre = ?, strRuta = ?, orden = ? WHERE id = ?';
        return await db.update(sql, [data.strNombreMenu, data.idPadre, data.strRuta, data.orden, id]);
    },

    /**
     * Elimina un menú
     */
    async delete(id) {
        const sql = 'DELETE FROM menu WHERE id = ?';
        return await db.delete(sql, [id]);
    },

    /**
     * Obtiene los menús raíz (padres)
     */
    async getRootMenus() {
        const sql = 'SELECT * FROM menu WHERE idPadre IS NULL ORDER BY orden';
        return await db.query(sql);
    },

    /**
     * Obtiene los submenús de un menú padre
     */
    async getChildren(parentId) {
        const sql = 'SELECT * FROM menu WHERE idPadre = ? ORDER BY orden';
        return await db.query(sql, [parentId]);
    },

    /**
     * Obtiene los menús que tienen módulos asignados (para el menú dinámico por permisos)
     */
    async getMenusConModulos() {
        const sql = `
            SELECT DISTINCT m.* 
            FROM menu m
            INNER JOIN menu_modulo mm ON m.id = mm.idMenu
            ORDER BY m.orden
        `;
        return await db.query(sql);
    },

    /**
     * Obtiene los módulos asociados a un menú
     */
    async getModulosByMenu(idMenu) {
        const sql = `
            SELECT m.* 
            FROM modulo m
            INNER JOIN menu_modulo mm ON m.id = mm.idModulo
            WHERE mm.idMenu = ?
        `;
        return await db.query(sql, [idMenu]);
    }
};

module.exports = Menu;