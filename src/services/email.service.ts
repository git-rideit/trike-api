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

    async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
        const mailOptions = {
            from: `"Trike Password Reset" <${env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            text: `Hello ${name},\n\nYou requested a password reset. Use the following link to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
            html: `<p>Hello <b>${name}</b>,</p><p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p>`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Password reset email sent to ${email}`);
        } catch (error) {
            logger.error(`Error sending password reset email: ${error}`);
            // Do not throw; caller can decide how to respond
        }
    }

    async sendPasswordResetCode(email: string, name: string, code: string) {
        const mailOptions = {
            from: `"Trike Password Reset" <${env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Verification Code',
            text: `Hello ${name},\n\nYour password reset verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
            html: `<p>Hello <b>${name}</b>,</p><p>Your password reset verification code is:</p><h2>${code}</h2><p>This code will expire in 10 minutes.</p><p>If you didn't request this, ignore this email.</p>`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`Password reset code sent to ${email}`);
        } catch (error) {
            logger.error(`Error sending password reset code: ${error}`);
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
