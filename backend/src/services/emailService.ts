import sgMail from '@sendgrid/mail';
import logger from '../config/logger';

// Initialize SendGrid
if (process.env['SENDGRID_API_KEY']) {
  sgMail.setApiKey(process.env['SENDGRID_API_KEY']);
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface BookingEmailData {
  booking: {
    id: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string | null;
    bookingDate: Date;
    startTime: Date;
    endTime: Date;
    status: string;
    projectDetails?: string | null;
    budgetRange?: string | null;
    location?: string | null;
    notes?: string | null;
  };
  service?: {
    id: string;
    name: string;
    category?: {
      name: string;
    };
  } | null;
}

export interface ContactEmailData {
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    serviceInterest?: string | null;
  };
}

export class EmailService {
  private readonly fromEmail: string;
  private readonly adminEmail: string;
  private readonly companyName: string;

  constructor() {
    this.fromEmail = process.env['FROM_EMAIL'] || 'noreply@derjiproductions.com';
    this.adminEmail = process.env['ADMIN_EMAIL'] || 'admin@derjiproductions.com';
    this.companyName = 'Derji Productions';
  }

  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    if (!process.env['SENDGRID_API_KEY']) {
      logger.warn('SendGrid API key not configured, email not sent', {
        to,
        subject,
        service: 'EmailService',
      });
      return;
    }

    try {
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.companyName,
        },
        subject,
        text,
        html,
      };

      await sgMail.send(msg);
      
      logger.info('Email sent successfully', {
        to,
        subject,
        service: 'EmailService',
      });
    } catch (error) {
      logger.error('Failed to send email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to,
        subject,
        service: 'EmailService',
      });
      throw error;
    }
  }

  private generateBookingConfirmationTemplate(data: BookingEmailData): EmailTemplate {
    const { booking, service } = data;
    const bookingDate = booking.bookingDate.toLocaleDateString();
    const startTime = booking.startTime.toLocaleTimeString();
    const endTime = booking.endTime.toLocaleTimeString();
    const serviceName = service?.name || 'General Service';
    const categoryName = service?.category?.name || '';

    const subject = `Booking Confirmation - ${serviceName} on ${bookingDate}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37, #f4e4a6); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: #2c1810; margin: 0; font-size: 28px; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .booking-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-confirmed { background: #d4edda; color: #155724; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.companyName}</h1>
            <p style="margin: 10px 0 0 0; color: #2c1810;">Professional Media Production Services</p>
          </div>
          
          <div class="content">
            <h2>Booking Confirmation</h2>
            <p>Dear ${booking.clientName},</p>
            <p>Thank you for booking with ${this.companyName}! Your booking has been received and is currently <span class="status-badge status-${booking.status}">${booking.status}</span>.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${booking.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${serviceName}${categoryName ? ` (${categoryName})` : ''}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${startTime} - ${endTime}</span>
              </div>
              ${booking.location ? `
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${booking.location}</span>
              </div>
              ` : ''}
              ${booking.budgetRange ? `
              <div class="detail-row">
                <span class="detail-label">Budget Range:</span>
                <span class="detail-value">${booking.budgetRange}</span>
              </div>
              ` : ''}
              ${booking.projectDetails ? `
              <div class="detail-row">
                <span class="detail-label">Project Details:</span>
                <span class="detail-value">${booking.projectDetails}</span>
              </div>
              ` : ''}
            </div>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Our team will review your booking and confirm availability within 24 hours</li>
              <li>You will receive a confirmation email once your booking is approved</li>
              <li>We may contact you to discuss project details and requirements</li>
              <li>Payment details and contracts will be provided upon confirmation</li>
            </ul>
            
            <p>If you have any questions or need to make changes to your booking, please contact us:</p>
            <ul>
              <li>Email: ${this.adminEmail}</li>
              <li>Phone: ${booking.clientPhone || 'Contact us via email'}</li>
            </ul>
            
            <p>We look forward to working with you!</p>
            <p>Best regards,<br>The ${this.companyName} Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 ${this.companyName}. All rights reserved.</p>
            <p>Professional Photography | Videography | Sound Production</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ${this.companyName} - Booking Confirmation
      
      Dear ${booking.clientName},
      
      Thank you for booking with ${this.companyName}! Your booking has been received and is currently ${booking.status}.
      
      Booking Details:
      - Booking ID: ${booking.id}
      - Service: ${serviceName}${categoryName ? ` (${categoryName})` : ''}
      - Date: ${bookingDate}
      - Time: ${startTime} - ${endTime}
      ${booking.location ? `- Location: ${booking.location}` : ''}
      ${booking.budgetRange ? `- Budget Range: ${booking.budgetRange}` : ''}
      ${booking.projectDetails ? `- Project Details: ${booking.projectDetails}` : ''}
      
      What's Next?
      - Our team will review your booking and confirm availability within 24 hours
      - You will receive a confirmation email once your booking is approved
      - We may contact you to discuss project details and requirements
      - Payment details and contracts will be provided upon confirmation
      
      If you have any questions or need to make changes to your booking, please contact us at ${this.adminEmail}.
      
      We look forward to working with you!
      
      Best regards,
      The ${this.companyName} Team
    `;

    return { subject, html, text };
  }

  private generateBookingNotificationTemplate(data: BookingEmailData): EmailTemplate {
    const { booking, service } = data;
    const bookingDate = booking.bookingDate.toLocaleDateString();
    const startTime = booking.startTime.toLocaleTimeString();
    const endTime = booking.endTime.toLocaleTimeString();
    const serviceName = service?.name || 'General Service';

    const subject = `New Booking: ${booking.clientName} - ${serviceName} on ${bookingDate}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c1810; color: #d4af37; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .booking-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; display: inline-block; width: 150px; }
          .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking Alert</h1>
            <p>Admin Notification</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <strong>⚠️ Action Required:</strong> A new booking has been submitted and requires your review.
            </div>
            
            <div class="booking-details">
              <h3>Booking Information</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                ${booking.id}
              </div>
              <div class="detail-row">
                <span class="detail-label">Client Name:</span>
                ${booking.clientName}
              </div>
              <div class="detail-row">
                <span class="detail-label">Client Email:</span>
                ${booking.clientEmail}
              </div>
              ${booking.clientPhone ? `
              <div class="detail-row">
                <span class="detail-label">Client Phone:</span>
                ${booking.clientPhone}
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                ${serviceName}
              </div>
              <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                ${bookingDate} from ${startTime} to ${endTime}
              </div>
              ${booking.location ? `
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                ${booking.location}
              </div>
              ` : ''}
              ${booking.budgetRange ? `
              <div class="detail-row">
                <span class="detail-label">Budget Range:</span>
                ${booking.budgetRange}
              </div>
              ` : ''}
              ${booking.projectDetails ? `
              <div class="detail-row">
                <span class="detail-label">Project Details:</span>
                ${booking.projectDetails}
              </div>
              ` : ''}
              ${booking.notes ? `
              <div class="detail-row">
                <span class="detail-label">Notes:</span>
                ${booking.notes}
              </div>
              ` : ''}
            </div>
            
            <h3>Next Steps</h3>
            <ol>
              <li>Review the booking details and check availability</li>
              <li>Contact the client if you need additional information</li>
              <li>Update the booking status in the admin panel</li>
              <li>Send confirmation or follow-up communication to the client</li>
            </ol>
            
            <p><strong>Remember:</strong> Respond to booking requests within 24 hours to maintain excellent customer service.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Booking Alert - Admin Notification
      
      A new booking has been submitted and requires your review.
      
      Booking Information:
      - Booking ID: ${booking.id}
      - Client Name: ${booking.clientName}
      - Client Email: ${booking.clientEmail}
      ${booking.clientPhone ? `- Client Phone: ${booking.clientPhone}` : ''}
      - Service: ${serviceName}
      - Date & Time: ${bookingDate} from ${startTime} to ${endTime}
      ${booking.location ? `- Location: ${booking.location}` : ''}
      ${booking.budgetRange ? `- Budget Range: ${booking.budgetRange}` : ''}
      ${booking.projectDetails ? `- Project Details: ${booking.projectDetails}` : ''}
      ${booking.notes ? `- Notes: ${booking.notes}` : ''}
      
      Next Steps:
      1. Review the booking details and check availability
      2. Contact the client if you need additional information
      3. Update the booking status in the admin panel
      4. Send confirmation or follow-up communication to the client
      
      Remember: Respond to booking requests within 24 hours to maintain excellent customer service.
    `;

    return { subject, html, text };
  }

  private generateContactInquiryTemplate(data: ContactEmailData): EmailTemplate {
    const { inquiry } = data;

    const subject = `New Contact Inquiry from ${inquiry.name}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c1810; color: #d4af37; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .inquiry-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; display: inline-block; width: 150px; }
          .message-box { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Inquiry</h1>
            <p>Admin Notification</p>
          </div>
          
          <div class="content">
            <div class="inquiry-details">
              <h3>Contact Information</h3>
              <div class="detail-row">
                <span class="detail-label">Inquiry ID:</span>
                ${inquiry.id}
              </div>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                ${inquiry.name}
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                ${inquiry.email}
              </div>
              ${inquiry.phone ? `
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                ${inquiry.phone}
              </div>
              ` : ''}
              ${inquiry.subject ? `
              <div class="detail-row">
                <span class="detail-label">Subject:</span>
                ${inquiry.subject}
              </div>
              ` : ''}
              ${inquiry.serviceInterest ? `
              <div class="detail-row">
                <span class="detail-label">Service Interest:</span>
                ${inquiry.serviceInterest}
              </div>
              ` : ''}
            </div>
            
            <h3>Message</h3>
            <div class="message-box">
              ${inquiry.message.replace(/\n/g, '<br>')}
            </div>
            
            <p><strong>Action Required:</strong> Please respond to this inquiry promptly to maintain excellent customer service.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Contact Inquiry - Admin Notification
      
      Contact Information:
      - Inquiry ID: ${inquiry.id}
      - Name: ${inquiry.name}
      - Email: ${inquiry.email}
      ${inquiry.phone ? `- Phone: ${inquiry.phone}` : ''}
      ${inquiry.subject ? `- Subject: ${inquiry.subject}` : ''}
      ${inquiry.serviceInterest ? `- Service Interest: ${inquiry.serviceInterest}` : ''}
      
      Message:
      ${inquiry.message}
      
      Action Required: Please respond to this inquiry promptly to maintain excellent customer service.
    `;

    return { subject, html, text };
  }

  async sendBookingConfirmation(data: BookingEmailData): Promise<void> {
    const template = this.generateBookingConfirmationTemplate(data);
    await this.sendEmail(
      data.booking.clientEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  async sendBookingNotificationToAdmin(data: BookingEmailData): Promise<void> {
    const template = this.generateBookingNotificationTemplate(data);
    await this.sendEmail(
      this.adminEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  async sendContactInquiryNotification(data: ContactEmailData): Promise<void> {
    const template = this.generateContactInquiryTemplate(data);
    await this.sendEmail(
      this.adminEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  async sendBookingStatusUpdate(data: BookingEmailData, previousStatus: string): Promise<void> {
    const { booking, service } = data;
    const bookingDate = booking.bookingDate.toLocaleDateString();
    const startTime = booking.startTime.toLocaleTimeString();
    const serviceName = service?.name || 'General Service';

    let statusMessage = '';
    let nextSteps = '';

    switch (booking.status) {
      case 'confirmed':
        statusMessage = 'Great news! Your booking has been confirmed.';
        nextSteps = 'We will contact you closer to the date with final details and preparation instructions.';
        break;
      case 'cancelled':
        statusMessage = 'Your booking has been cancelled as requested.';
        nextSteps = 'If you need to reschedule, please feel free to submit a new booking request.';
        break;
      case 'completed':
        statusMessage = 'Your booking has been completed. Thank you for choosing our services!';
        nextSteps = 'We hope you were satisfied with our service. Please consider leaving us a review.';
        break;
      default:
        statusMessage = `Your booking status has been updated to: ${booking.status}`;
        nextSteps = 'We will keep you informed of any further updates.';
    }

    const subject = `Booking Update: ${serviceName} on ${bookingDate} - ${booking.status.toUpperCase()}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37, #f4e4a6); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: #2c1810; margin: 0; font-size: 28px; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .status-update { background: #e8f5e8; border: 1px solid #4caf50; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .booking-summary { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.companyName}</h1>
            <p style="margin: 10px 0 0 0; color: #2c1810;">Booking Status Update</p>
          </div>
          
          <div class="content">
            <h2>Hello ${booking.clientName},</h2>
            
            <div class="status-update">
              <h3>📋 ${statusMessage}</h3>
              <p><strong>Previous Status:</strong> ${previousStatus} → <strong>Current Status:</strong> ${booking.status}</p>
            </div>
            
            <div class="booking-summary">
              <h4>Booking Summary</h4>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date & Time:</strong> ${bookingDate} at ${startTime}</p>
              <p><strong>Booking ID:</strong> ${booking.id}</p>
            </div>
            
            <p>${nextSteps}</p>
            
            <p>If you have any questions, please don't hesitate to contact us at ${this.adminEmail}.</p>
            
            <p>Best regards,<br>The ${this.companyName} Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 ${this.companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ${this.companyName} - Booking Status Update
      
      Hello ${booking.clientName},
      
      ${statusMessage}
      
      Previous Status: ${previousStatus} → Current Status: ${booking.status}
      
      Booking Summary:
      - Service: ${serviceName}
      - Date & Time: ${bookingDate} at ${startTime}
      - Booking ID: ${booking.id}
      
      ${nextSteps}
      
      If you have any questions, please don't hesitate to contact us at ${this.adminEmail}.
      
      Best regards,
      The ${this.companyName} Team
    `;

    await this.sendEmail(booking.clientEmail, subject, html, text);
  }
}

export const emailService = new EmailService();