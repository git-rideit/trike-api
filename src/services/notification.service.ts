import { getMessaging } from '../config/firebase';

export class NotificationService {
    static async sendPushNotification(fcmToken: string, title: string, body: string, data: any) {

        // Convert data values to strings because FCM requires string values in data payload
        const stringData: Record<string, string> = {};
        if (data) {
            Object.keys(data).forEach(key => {
                stringData[key] = String(data[key]);
            });
        }

        const message = {
            token: fcmToken,
            notification: {
                title,
                body
            },
            data: stringData
        };

        try {
            const messaging = getMessaging();
            const response = await messaging.send(message);
            console.log('✅ Successfully sent message:', response);
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}
