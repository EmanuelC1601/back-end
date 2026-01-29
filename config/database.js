const mysql = require('mysql2');

// Configuración de la base de datos (ajusta según tu entorno)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'proyecto_angular',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('🔧 Configuración de BD:', {
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user
});

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Convertir a promises
const promisePool = pool.promise();

// Probar conexión
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    console.log('💡 Asegúrate de que:');
    console.log('   1. MySQL esté instalado y corriendo');
    console.log('   2. Las credenciales en .env sean correctas');
    console.log('   3. La base de datos exista');
  } else {
    console.log('✅ Conectado a MySQL correctamente');
    connection.release();
  }
});

module.exports = {
  query: async (sql, params) => {
    try {
      const [rows] = await promisePool.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Error en consulta SQL:', error.message);
      console.log('SQL:', sql);
      console.log('Parámetros:', params);
      throw error;
    }
  },
  
  execute: async (sql, params) => {
    try {
      const [result] = await promisePool.execute(sql, params);
      return result;
    } catch (error) {
      console.error('Error ejecutando SQL:', error.message);
      console.log('SQL:', sql);
      console.log('Parámetros:', params);
      throw error;
    }
  }
};