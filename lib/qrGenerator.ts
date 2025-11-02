/**
 * QR Code Generator Utility
 * Generates unique QR codes for tickets
 */

import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ticket number
 */
export function generateTicketNumber(): string {
    // Format: TKT-YYYYMMDD-HHHMMSS-XXXXX
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = uuidv4().substring(0, 5).toUpperCase();
    
    return `TKT-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

/**
 * Generate a unique QR code string
 * Contains: ticketId, eventId, userId (encrypted/encoded)
 */
export function generateQRCodeString(ticketId: string, eventId: string, userId: string): string {
    // Create a JSON-like structure that's easy to parse
    // Format: TICKET_ID|EVENT_ID|USER_ID|TIMESTAMP
    const timestamp = Date.now();
    const data = `${ticketId}|${eventId}|${userId}|${timestamp}`;
    
    // Optionally encrypt this data in the future for security
    return Buffer.from(data).toString('base64');
}

/**
 * Decode QR code string back to components
 */
export function decodeQRCodeString(qrCode: string): {
    ticketId: string;
    eventId: string;
    userId: string;
    timestamp: number;
} | null {
    try {
        const decoded = Buffer.from(qrCode, 'base64').toString('utf-8');
        const parts = decoded.split('|');
        
        if (parts.length !== 4) {
            return null;
        }
        
        return {
            ticketId: parts[0],
            eventId: parts[1],
            userId: parts[2],
            timestamp: parseInt(parts[3], 10)
        };
    } catch (error) {
        console.error('Error decoding QR code:', error);
        return null;
    }
}

/**
 * Generate QR code as image (base64)
 */
export async function generateQRCodeImage(data: string): Promise<string> {
    try {
        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H', // High error correction
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 300
        });
        
        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR code image:', error);
        throw new Error('Failed to generate QR code image');
    }
}

/**
 * Generate complete ticket QR code
 */
export async function generateTicketQR(
    ticketId: string,
    eventId: string,
    userId: string
): Promise<{
    qrCode: string;
    qrCodeImage: string;
}> {
    const qrCodeString = generateQRCodeString(ticketId, eventId, userId);
    const qrCodeImage = await generateQRCodeImage(qrCodeString);
    
    return {
        qrCode: qrCodeString,
        qrCodeImage
    };
}

