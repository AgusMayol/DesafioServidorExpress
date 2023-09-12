import nodemailer from "nodemailer";
import { NODEMAILER_ACCOUNT, NODEMAILER_PASSWORD } from "./config.js";
import { log } from "./config/logger.config.js";

// Configuración del transporte
const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: NODEMAILER_ACCOUNT,
        pass: NODEMAILER_PASSWORD,
    },


});
// Función para enviar el correo electrónico
export async function sendEmail(to, subject, text, html) {
    const mailOptions = {
        from: NODEMAILER_ACCOUNT,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        log.info("Correo electrónico enviado satisfactoriamente.")
    } catch (error) {
        log.error("Error al enviar el correo:", error)
    }
}