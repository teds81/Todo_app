CREATE DATABASE IF NOT EXISTS todo_db;
USE todo_db;

CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    texte VARCHAR(255) NOT NULL,
    priority ENUM('Urgent', 'Moyenne', 'Basse') DEFAULT 'Moyenne',
    completed BOOLEAN DEFAULT FALSE
);
