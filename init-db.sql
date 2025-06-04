-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS sop_manager;

-- Utilisation de la base de données
USE sop_manager;

-- Création des tables se fait via Prisma avec la commande npx prisma migrate deploy
-- Ce fichier est utile pour des configurations supplémentaires si nécessaire 