import 'dotenv/config'

export const MONGODB_URL = process.env.MONGODB_URL;
export const PORT = process.env.PORT || 8080;
export const SECRET = process.env.SECRET || "mongoSecret";
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/api/sessions/githubcallback';
export const NODEMAILER_ACCOUNT = process.env.NODEMAILER_ACCOUNT;
export const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD;
export const ENVIRONMENT = process.env.ENVIRONMENT || "PRODUCTION";