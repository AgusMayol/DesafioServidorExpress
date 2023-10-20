import 'dotenv/config'
import __dirname from "./utils.js";

export const MONGODB_URL = process.env.MONGODB_URL;
export const PORT = process.env.PORT || 8080;
export const SECRET = process.env.SECRET || "mongoSecret";
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || `/api/sessions/githubcallback`;
export const NODEMAILER_ACCOUNT = process.env.NODEMAILER_ACCOUNT;
export const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD;
export const ENVIRONMENT = process.env.ENVIRONMENT || "PRODUCTION";
export const URL = process.env.URL || `http://localhost:${PORT}`;

export const SwaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Sessions API",
            description: "A simple Express Library API"
        }
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}