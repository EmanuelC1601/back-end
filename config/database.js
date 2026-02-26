const mysql = require('mysql2');

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'db39383.public.databaseasp.net',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'db39383',
  password: process.env.DB_PASSWORD || 'oK@2#9Hd7Ek+',
  database: process.env.DB_DATABASE || 'db39383',
  
  // 🔥 CONFIGURACIÓN CRÍTICA PARA RENDER:
  waitForConnections: true,
  connectionLimit: 5,           // Reducido para plan Free
  queueLimit: 0,
  connectTimeout: 15000,        // 15 segundos para conexión inicial
  acquireTimeout: 10000,        // 10 segundos para adquirir conexión
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 segundos
  
  // ⚠️ REMOVEMOS SSL porque el servidor no lo soporta
  // ssl: {
  //   rejectUnauthorized: false
  // },
  
  // Timezone y codificación
  timezone: 'Z',
  dateStrings: true,
  charset: 'utf8mb4'
};

console.log('🔧 Configuración de BD:', {
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: 'desactivado' // Porque el servidor no soporta
});

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Crear versión con promesas
const promisePool = pool.promise();

// Eventos para monitoreo
pool.on('connection', (connection) => {
  console.log('🔄 Nueva conexión MySQL establecida (ID:', connection.threadId, ')');
});

pool.on('acquire', (connection) => {
  console.log('📥 Conexión MySQL adquirida (ID:', connection.threadId, ')');
});

pool.on('release', (connection) => {
  console.log('📤 Conexión MySQL liberada (ID:', connection.threadId, ')');
});

pool.on('enqueue', () => {
  console.log('⏳ Esperando conexión MySQL disponible...');
});

// Función con reintentos automáticos
const executeWithRetry = async (sql, params, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [result] = await promisePool.execute(sql, params);
      return result;
    } catch (error) {
      console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, error.code || error.message);
      
      // Si es error de conexión y no es el último intento, esperar y reintentar
      if ((error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') && attempt < maxRetries) {
        const delay = 2000 * attempt; // Delay incremental
        console.log(`⏳ Esperando ${delay}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
};

const queryWithRetry = async (sql, params, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [rows] = await promisePool.query(sql, params);
      return rows;
    } catch (error) {
      console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, error.code || error.message);
      
      // Si es error de conexión y no es el último intento, esperar y reintentar
      if ((error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') && attempt < maxRetries) {
        const delay = 2000 * attempt; // Delay incremental
        console.log(`⏳ Esperando ${delay}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
};

// Probar conexión al iniciar
async function testConnection() {
  try {
    const [result] = await promisePool.query('SELECT 1 + 1 AS test');
    console.log('✅ Conectado a MySQL correctamente. Test:', result[0].test);
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    console.log('💡 Asegúrate de que:');
    console.log('   1. La base de datos esté activa');
    console.log('   2. Las credenciales sean correctas');
    console.log('   3. El firewall permita conexiones desde Render');
  }
}

// Ejecutar test de conexión
testConnection();

// Exportar funciones
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
  getConnection: async () => {
    try {
      const connection = await promisePool.getConnection();
      return connection;
    } catch (error) {
      console.error('❌ Error obteniendo conexión:', error.message);
      throw error;
    }
  }
};
