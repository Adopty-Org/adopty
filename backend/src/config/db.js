import mysql from "mysql2/promise";
import { ENV } from "./env.js";

export let db; // exporte la connexion

export const connectDB = async () => {
  try {
    if (db) return db; // ✅ évite de recréer le pool
    db = mysql.createPool({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASS,
      database: ENV.DB_NAME,
      ssl: { rejectUnauthorized: true } // TiDB Cloud requiert SSL
    });

    console.log(`✅ Connecté à la base de données: ${ENV.DB_HOST}`);
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données :", error);
    process.exit(1);
  }
};