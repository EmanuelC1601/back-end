// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
    console.error(err.stack);

    // Errores conocidos de MySQL
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Registro duplicado' });
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: 'Referencia a un registro que no existe' });
    }

    res.status(500).json({ message: 'Error interno del servidor' });
};