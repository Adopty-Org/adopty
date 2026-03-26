import dotenv from "dotenv"

dotenv.config();

export const ENV = {
    NODE_ENV:process.env.NODE_ENV,
    PORT:process.env.PORT,
    DB_URL:process.env.DB_URL,
    DB_HOST:process.env.DB_HOST,
    DB_PORT:process.env.DB_PORT,
    DB_USER:process.env.DB_USER,
    DB_PASS:process.env.DB_PASS,
    DB_NAME:process.env.DB_NAME,
    CLERK_PUBLISHABLE_KEY:process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY:process.env.CLERK_SECRET_KEY,
    INNGEST_SIGNING_KEY:process.env.INNGEST_SIGNING_KEY,
    CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET:process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME,
    ADMIN_EMAIL:process.env.ADMIN_EMAIL,
}