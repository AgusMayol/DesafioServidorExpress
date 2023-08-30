import nodemailer from "nodemailer";
import { NODEMAILER_ACCOUNT, NODEMAILER_PASSWORD } from "./config.js";
import { log } from "./config/logger.config.js";

// Configuración del transporte
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: NODEMAILER_ACCOUNT,
        pass: NODEMAILER_PASSWORD,
    },
});

// Función para enviar el correo electrónico
export async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: NODEMAILER_ACCOUNT,
        to: to,
        subject: subject,
        text: text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        log.info("Correo electrónico enviado:", info.response)
    } catch (error) {
        log.error("Error al enviar el correo:", error)
    }
}