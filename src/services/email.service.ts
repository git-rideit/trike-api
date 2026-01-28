import nodemailer from 'nodemailer';
import { env } from '../config/env';
import logger from '../utils/logger';

class EmailService {
    private transporter;

    constructor() {
        // For MVP, using Gmail or standard SMTP.
        // In production, use SendGrid/Mailgun/AWS SES.
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.EMAIL_USER, // Need to add these to .env or config
                pass: env.EMAIL_PASS
            }
        });
    }

    async sendDriverApprovalEmail(email: string, name: string) {
        const mailOptions = {
            from: `"Trike App Admin" <${env.EMAIL_USER}>`,
            to: email,
            subject: 'Trike Application Approved',
            text: `Hello ${name},\n\nYour driver application has been approved! You can now log in and start accepting rides.\n\nRegards,\nThe Trike Team`,
            html: `<p>Hello <b>${name}</b>,</p><p>Your driver application has been <b>approved</b>! You can now log in and start accepting rides.</p><br><p>Regards,<br>The Trike Team</p>`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Approval email sent to ${email}`);
        } catch (error) {
            logger.error(`Error sending approval email: ${error}`);
            // Don't throw, just log. Email failure shouldn't crash the request logic usually.
        }
    }

    async sendSOSEmail(userEmail: string, userName: string, lat: number, lng: number, emergencyContactEmail?: string) {
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const recipients = [env.ADMIN_EMAIL]; // Always alert admin
        if (emergencyContactEmail) recipients.push(emergencyContactEmail);

        // Filter out undefined values just in case
        const validRecipients = recipients.filter(email => email !== undefined) as string[];

        const mailOptions = {
            from: `"Trike Safety Alert" <${env.EMAIL_USER}>`,
            to: validRecipients,
            subject: `SOS ALERT: ${userName}`,
            text: `URGENT: User ${userName} has triggered an SOS alert!\n\nLocation: ${mapUrl}\n\nPlease take immediate action.`,
            html: `<h1 style="color:red;">SOS ALERT</h1><p><b>User:</b> ${userName}</p><p><b>Email:</b> ${userEmail}</p><p><b>Location:</b> <a href="${mapUrl}">Open in Google Maps</a></p><p>Please take immediate action.</p>`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`SOS email sent for user ${userName}`);
        } catch (error) {
            logger.error(`Error sending SOS email: ${error}`);
        }
    }
}

export const emailService = new EmailService();
