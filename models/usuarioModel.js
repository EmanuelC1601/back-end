// models/usuarioModel.js
const db = require('./db');

const Usuario = {
    /**
     * Obtiene todos los usuarios con paginación, incluyendo nombre del perfil
     */
    async getAll(limit = 5, offset = 0) {
        const sql = `
            SELECT u.*, p.strNombrePerfil 
            FROM usuario u
            LEFT JOIN perfil p ON u.idPerfil = p.id
            LIMIT ? OFFSET ?
        `;
        return await db.query(sql, [limit, offset]);
    },

    /**
     * Cuenta total de usuarios
     */
    async getCount() {
        const sql = 'SELECT COUNT(*) as total FROM usuario';
        const result = await db.getOne(sql);
        return result.total;
    },

    /**
     * Obtiene un usuario por ID con detalles del perfil
     */
    async getById(id) {
        const sql = `
            SELECT u.*, p.strNombrePerfil 
            FROM usuario u
            LEFT JOIN perfil p ON u.idPerfil = p.id
            WHERE u.id = ?
        `;
        return await db.getOne(sql, [id]);
    },

    /**
     * Obtiene usuario por nombre de usuario (para login)
     */
    async getByUsername(username) {
        const sql = 'SELECT * FROM usuario WHERE strNombreUsuario = ?';
        return await db.getOne(sql, [username]);
    },

    /**
     * Crea un nuevo usuario
     * Nota: la contraseña debe estar hasheada antes de llamar a este método
     */
    async create(data) {
        const sql = `
            INSERT INTO usuario 
            (strNombreUsuario, idPerfil, strPwd, idEstadoUsuario, strCorreo, strNumeroCelular, strImagen) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return await db.insert(sql, [
            data.strNombreUsuario,
            data.idPerfil,
            data.strPwd,
            data.idEstadoUsuario !== undefined ? data.idEstadoUsuario : true,
            data.strCorreo,
            data.strNumeroCelular || null,
            data.strImagen || null
        ]);
    },

    /**
     * Actualiza un usuario existente
     * Si no se proporciona nueva contraseña, no la actualiza
     */
    async update(id, data) {
        let sql, params;
        if (data.strPwd) {
            sql = `
                UPDATE usuario SET 
                strNombreUsuario = ?, idPerfil = ?, strPwd = ?, idEstadoUsuario = ?, 
                strCorreo = ?, strNumeroCelular = ?, strImagen = ? 
                WHERE id = ?
            `;
            params = [
                data.strNombreUsuario,
                data.idPerfil,
                data.strPwd,
                data.idEstadoUsuario,
                data.strCorreo,
                data.strNumeroCelular,
                data.strImagen,
                id
            ];
        } else {
            sql = `
                UPDATE usuario SET 
                strNombreUsuario = ?, idPerfil = ?, idEstadoUsuario = ?, 
                strCorreo = ?, strNumeroCelular = ?, strImagen = ? 
                WHERE id = ?
            `;
            params = [
                data.strNombreUsuario,
                data.idPerfil,
                data.idEstadoUsuario,
                data.strCorreo,
                data.strNumeroCelular,
                data.strImagen,
                id
            ];
        }
        return await db.update(sql, params);
    },

    /**
     * Elimina un usuario por ID
     */
    async delete(id) {
        const sql = 'DELETE FROM usuario WHERE id = ?';
        return await db.delete(sql, [id]);
    },

    /**
     * Actualiza solo la imagen del usuario
     */
    async updateImagen(id, rutaImagen) {
        const sql = 'UPDATE usuario SET strImagen = ? WHERE id = ?';
        return await db.update(sql, [rutaImagen, id]);
    }
};

module.exports = Usuario;