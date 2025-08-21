
import nodemailer  from 'nodemailer';

interface message {
    to: string,
    subject: string,
    text: string
}

export const sendMail= async (message: message) => {
    try{
        const transporter= nodemailer.createTransport({
            host:process.env.MAILTRAP_SMTP_HOST,
            port: parseInt(process.env.MAILTRAP_SMTP_PORT || '587', 10),
            auth: {
                user: process.env.MAILTRAP_SMTP_USER,
                pass: process.env.MAILTRAP_SMTP_PASS
            }
        });
        const info= await transporter.sendMail({
            from:'"Inngest TMS',
            to:message.to,
            subject:message.subject,
            text:message.text
        })
        console.log("Mail sent:", info.messageId);

    }catch(error){
        if (error instanceof Error) {
            console.error("Mail error:", error.message);
        } else {
            console.error("Mail error:", error);
        }
        throw error;
    }
}