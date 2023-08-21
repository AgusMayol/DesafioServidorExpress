import nodemailer from "nodemailer";
import { NODEMAILER_ACCOUNT, NODEMAILER_PASSWORD } from "./config.js";

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
        console.log("Correo electrónico enviado:", info.response);
    } catch (error) {
        console.log("Error al enviar el correo:", error);
    }
}