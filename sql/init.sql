-- ============================================
-- BASE DE DATOS: proyecto_angular
-- ============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS proyecto_angular;
USE proyecto_angular;

-- ============================================
-- TABLA: Registros (para inserción automática)
-- ============================================
CREATE TABLE IF NOT EXISTS Registros (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Usuario VARCHAR(50) NOT NULL,
    Password VARCHAR(50) NOT NULL,
    Serie INT NOT NULL,
    FechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (Usuario),
    INDEX idx_fecha (FechaRegistro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Usuarios (para formulario de registro)
-- ============================================
CREATE TABLE IF NOT EXISTS Usuarios (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Usuario VARCHAR(50) NOT NULL UNIQUE,
    FechaNacimiento DATE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (Usuario),
    INDEX idx_fecha (FechaRegistro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Imagenes (para subida de imágenes)
-- ============================================
CREATE TABLE IF NOT EXISTS Imagenes (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    NombreOriginal VARCHAR(255) NOT NULL,
    NombreArchivo VARCHAR(255) NOT NULL UNIQUE,
    Ruta VARCHAR(500) NOT NULL,
    Tipo VARCHAR(50) NOT NULL,
    Tamaño INT NOT NULL,
    FechaSubida DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha (FechaSubida),
    INDEX idx_nombre (NombreArchivo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    edad INT NOT NULL,
    mensaje TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;