import winston from "winston";
import { ENVIRONMENT } from "../config.js";

const devLogger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(info => {
            return `[${info.timestamp}] - ${info.level}: ${info.message}`;
        })
    ),
    transports: [new winston.transports.Console()],
});

const prodLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            return `[${info.timestamp}] - ${info.level}: ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: "./logs/error.log", level: "warn" }),
        new winston.transports.Console(),
    ],
});

export const addLogger = (req, res, next) => {
    req.logger = ENVIRONMENT === "PRODUCTION" ? prodLogger : devLogger;
    req.logger.http(`${req.method} en ${req.url}`);
    next();
};

// Logger global para uso fuera del contexto de solicitud
const globalLogger = ENVIRONMENT === "PRODUCTION" ? prodLogger : devLogger;

export const log = globalLogger;
