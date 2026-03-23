-- ============================================================
-- init.sql — Schema completo del proyecto Tercera Unidad
-- Ejecutar en el orden indicado (respeta foreign keys)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Tabla: perfil
CREATE TABLE IF NOT EXISTS perfil (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    strNombrePerfil VARCHAR(100) NOT NULL,
    bitAdministrador TINYINT(1) NOT NULL DEFAULT 0,
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: usuario
CREATE TABLE IF NOT EXISTS usuario (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    strNombreUsuario VARCHAR(100) NOT NULL UNIQUE,
    idPerfil         INT NOT NULL,
    strPwd           VARCHAR(255) NOT NULL,
    idEstadoUsuario  TINYINT(1) NOT NULL DEFAULT 1,
    strCorreo        VARCHAR(150) NOT NULL,
    strNumeroCelular VARCHAR(20)  NULL,
    strImagen        VARCHAR(255) NULL,
    createdAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idPerfil) REFERENCES perfil(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: modulo
CREATE TABLE IF NOT EXISTS modulo (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    strNombreModulo  VARCHAR(100) NOT NULL,
    createdAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: permisosperfil
CREATE TABLE IF NOT EXISTS permisosperfil (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    idModulo     INT NOT NULL,
    idPerfil     INT NOT NULL,
    bitAgregar   TINYINT(1) NOT NULL DEFAULT 0,
    bitEditar    TINYINT(1) NOT NULL DEFAULT 0,
    bitConsulta  TINYINT(1) NOT NULL DEFAULT 0,
    bitEliminar  TINYINT(1) NOT NULL DEFAULT 0,
    bitDetalle   TINYINT(1) NOT NULL DEFAULT 0,
    createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_modulo_perfil (idModulo, idPerfil),
    FOREIGN KEY (idModulo) REFERENCES modulo(id),
    FOREIGN KEY (idPerfil) REFERENCES perfil(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: menu (para estructura de menú)
CREATE TABLE IF NOT EXISTS menu (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    strNombreMenu  VARCHAR(100) NOT NULL,
    idPadre        INT NULL,
    strRuta        VARCHAR(200) NULL,
    orden          INT NOT NULL DEFAULT 0,
    FOREIGN KEY (idPadre) REFERENCES menu(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: menu_modulo (relación menú ↔ módulo)
CREATE TABLE IF NOT EXISTS menu_modulo (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    idMenu   INT NOT NULL,
    idModulo INT NOT NULL,
    FOREIGN KEY (idMenu)   REFERENCES menu(id)   ON DELETE CASCADE,
    FOREIGN KEY (idModulo) REFERENCES modulo(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Módulos del sistema (coinciden con rutas del frontend)
INSERT IGNORE INTO modulo (id, strNombreModulo) VALUES
(1, 'perfil'),
(2, 'modulo'),
(3, 'permisos-perfil'),
(4, 'usuario'),
(5, 'principal1-1'),
(6, 'principal1-2'),
(7, 'principal2-1'),
(8, 'principal2-2');

-- Menús raíz
INSERT IGNORE INTO menu (id, strNombreMenu, idPadre, strRuta, orden) VALUES
(1, 'Seguridad',   NULL, NULL,           1),
(2, 'Principal 1', NULL, NULL,           2),
(3, 'Principal 2', NULL, NULL,           3);

-- Submenús
INSERT IGNORE INTO menu (id, strNombreMenu, idPadre, strRuta, orden) VALUES
(4, 'Perfil',           1, '/seguridad/perfil',           1),
(5, 'Módulo',           1, '/seguridad/modulo',           2),
(6, 'Permisos Perfil',  1, '/seguridad/permisos-perfil',  3),
(7, 'Usuario',          1, '/seguridad/usuario',          4),
(8, 'Principal 1.1',    2, '/principal1/p11',             1),
(9, 'Principal 1.2',    2, '/principal1/p12',             2),
(10,'Principal 2.1',    3, '/principal2/p21',             1),
(11,'Principal 2.2',    3, '/principal2/p22',             2);

-- Asociar menús con módulos
INSERT IGNORE INTO menu_modulo (idMenu, idModulo) VALUES
(4, 1),(5, 2),(6, 3),(7, 4),
(8, 5),(9, 6),(10,7),(11,8);

-- Perfil administrador inicial
INSERT IGNORE INTO perfil (id, strNombrePerfil, bitAdministrador) VALUES
(1, 'Administrador', 1);

-- Usuario admin (contraseña: Admin123!)
-- Hash generado con bcrypt, rounds=10
INSERT IGNORE INTO usuario (id, strNombreUsuario, idPerfil, strPwd, idEstadoUsuario, strCorreo)
VALUES (1, 'admin', 1,
  '$2b$10$rQnj.PvXlD0vEMmN0JkHSOiP0CrJfW3Z2KxDaXoBNJ8FJlM3YGgAC',
  1, 'admin@empresa.com');

-- Permisos completos para el perfil administrador
INSERT IGNORE INTO permisosperfil (idModulo, idPerfil, bitAgregar, bitEditar, bitConsulta, bitEliminar, bitDetalle)
VALUES
(1,1,1,1,1,1,1),(2,1,1,1,1,1,1),(3,1,1,1,1,1,1),(4,1,1,1,1,1,1),
(5,1,1,1,1,1,1),(6,1,1,1,1,1,1),(7,1,1,1,1,1,1),(8,1,1,1,1,1,1);