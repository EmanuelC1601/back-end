const mysql = require('mysql2');

// Configuración mejorada para Render
const dbConfig = {
  host: process.env.DB_HOST || 'db39383.public.databaseasp.net',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'db39383',
  password: process.env.DB_PASSWORD || 'oK@2#9Hd7Ek+',
  database: process.env.DB_DATABASE || 'db39383',
  
  // 🔥 CONFIGURACIÓN CRÍTICA PARA RENDER:
  waitForConnections: true,
  connectionLimit: 5,           // REDUCE para plan Free
  queueLimit: 0,
  connectTimeout: 10000,        // 10 segundos
  acquireTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  
  // SSL para conexión externa
  ssl: {
    rejectUnauthorized: false
  },
  
  // Soporte para timezones
  timezone: 'Z',
  dateStrings: true,
  charset: 'utf8mb4'
};

console.log('🔧 Configuración de BD:', {
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: dbConfig.ssl ? 'activado' : 'desactivado'
});

// Crear pool con manejo de errores
let pool;

function createPool() {
  pool = mysql.createPool(dbConfig);
  
  // Manejar eventos del pool
  pool.on('connection', (connection) => {
    console.log('🔄 Nueva conexión MySQL establecida');
    // Ejecutar ping cada 30 segundos para mantener viva la conexión
    setInterval(() => {
      connection.ping();
    }, 30000);
  });
  
  pool.on('error', (err) => {
    console.error('❌ Error en pool MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('🔄 Reconectando MySQL en 2 segundos...');
      setTimeout(() => {
        pool.end(() => {
          createPool();
        });
      }, 2000);
    }
  });
  
  return pool.promise();
}

const promisePool = createPool();

// Función con reintentos
const executeWithRetry = async (sql, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const [result] = await promisePool.execute(sql, params);
      return result;
    } catch (error) {
      console.error(`❌ Intento ${i + 1}/${retries} falló:`, error.code);
      
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        if (i < retries - 1) {
          console.log(`⏳ Esperando 2 segundos antes de reintentar...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }
      throw error;
    }
  }
};

const queryWithRetry = async (sql, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const [rows] = await promisePool.query(sql, params);
      return rows;
    } catch (error) {
      console.error(`❌ Intento ${i + 1}/${retries} falló:`, error.code);
      
      if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
        if (i < retries - 1) {
          console.log(`⏳ Esperando 2 segundos antes de reintentar...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }
      throw error;
    }
  }
};

// Probar conexión
promisePool.getConnection()
  .then(connection => {
    console.log('✅ Conectado a MySQL correctamente');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

module.exports = {
  query: async (sql, params) => {
    try {
      return await queryWithRetry(sql, params);
    } catch (error) {
      console.error('❌ Error final en consulta SQL:', error.message);
      console.log('SQL:', sql);
      console.log('Parámetros:', params);
      throw error;
    }
  },
  
  execute: async (sql, params) => {
    try {
      return await executeWithRetry(sql, params);
    } catch (error) {
      console.error('❌ Error final ejecutando SQL:', error.message);
      console.log('SQL:', sql);
      console.log('Parámetros:', params);
      throw error;
    }
  },
  
  // Para transacciones
  getConnection: () => promisePool.getConnection()
};
