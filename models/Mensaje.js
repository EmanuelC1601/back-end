// models/Mensaje.js
const db = require('../config/database');

const Mensaje = {};

// Crear un nuevo mensaje
Mensaje.create = (nombre_completo, email, edad, mensaje) => {
    const now = new Date(); // Hora del servidor (si es tu laptop, será tu hora local)
    return db.execute(
        'INSERT INTO mensajes (nombre_completo, email, edad, mensaje, created_at) VALUES (?, ?, ?, ?, ?)',
        [nombre_completo, email, edad, mensaje, now]
    );
};

// Obtener todos los mensajes con paginación y filtros
Mensaje.findAll = (limit, offset, search, edadMin, edadMax) => {
    let query = 'SELECT * FROM mensajes WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (nombre_completo LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (edadMin) {
        query += ' AND edad >= ?';
        params.push(edadMin);
    }
    if (edadMax) {
        query += ' AND edad <= ?';
        params.push(edadMax);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.execute(query, params);
};

// Contar total de mensajes (para paginación) con los mismos filtros
Mensaje.count = (search, edadMin, edadMax) => {
    let query = 'SELECT COUNT(*) AS total FROM mensajes WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (nombre_completo LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (edadMin) {
        query += ' AND edad >= ?';
        params.push(edadMin);
    }
    if (edadMax) {
        query += ' AND edad <= ?';
        params.push(edadMax);
    }

    return db.execute(query, params);
};

// Obtener un mensaje por ID
Mensaje.findById = (id) => {
    return db.execute('SELECT * FROM mensajes WHERE id = ?', [id]);
};

// Actualizar un mensaje
Mensaje.update = (id, nombre_completo, email, edad, mensaje) => {
    return db.execute(
        'UPDATE mensajes SET nombre_completo = ?, email = ?, edad = ?, mensaje = ? WHERE id = ?',
        [nombre_completo, email, edad, mensaje, id]
    );
};

// Eliminar un mensaje
Mensaje.delete = (id) => {
    return db.execute('DELETE FROM mensajes WHERE id = ?', [id]);
};

module.exports = Mensaje;