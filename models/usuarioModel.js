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
 */
async update(id, data) {
    // Construir dinámicamente la consulta SQL
    const fields = [];
    const values = [];
    
    if (data.strNombreUsuario !== undefined) {
        fields.push('strNombreUsuario = ?');
        values.push(data.strNombreUsuario);
    }
    if (data.idPerfil !== undefined) {
        fields.push('idPerfil = ?');
        values.push(data.idPerfil);
    }
    if (data.strPwd !== undefined) {
        fields.push('strPwd = ?');
        values.push(data.strPwd);
    }
    if (data.idEstadoUsuario !== undefined) {
        fields.push('idEstadoUsuario = ?');
        values.push(data.idEstadoUsuario);
    }
    if (data.strCorreo !== undefined) {
        fields.push('strCorreo = ?');
        values.push(data.strCorreo);
    }
    if (data.strNumeroCelular !== undefined) {
        fields.push('strNumeroCelular = ?');
        values.push(data.strNumeroCelular);
    }
    if (data.strImagen !== undefined) {
        fields.push('strImagen = ?');
        values.push(data.strImagen);
    }
    
    if (fields.length === 0) {
        return; // No hay nada que actualizar
    }
    
    values.push(id);
    const sql = `UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`;
    
    console.log('📡 SQL Update:', sql);
    console.log('📡 Values:', values);
    
    return await db.update(sql, values);
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