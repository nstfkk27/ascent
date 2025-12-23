import { Resend } from 'resend';
import { logger } from './logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface PropertyEnquiryEmailData {
  propertyTitle: string;
  propertyUrl: string;
  enquirerName: string;
  enquirerEmail: string;
  enquirerPhone?: string;
  message: string;
  agentEmail: string;
  agentName: string;
}

export async function sendPropertyEnquiryEmail(data: PropertyEnquiryEmailData) {
  try {
    const { error } = await resend.emails.send({
      from: 'Ascent Real Estate <noreply@estateascent.com>',
      to: data.agentEmail,
      replyTo: data.enquirerEmail,
      subject: `New Property Enquiry: ${data.propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #496f5d;">New Property Enquiry</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Property Details</h3>
            <p><strong>Property:</strong> ${data.propertyTitle}</p>
            <p><a href="${data.propertyUrl}" style="color: #496f5d;">View Property</a></p>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Enquirer Information</h3>
            <p><strong>Name:</strong> ${data.enquirerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.enquirerEmail}">${data.enquirerEmail}</a></p>
            ${data.enquirerPhone ? `<p><strong>Phone:</strong> ${data.enquirerPhone}</p>` : ''}
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Message</h3>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
            <p>This enquiry was sent via Ascent Real Estate platform.</p>
            <p>You can reply directly to this email to respond to ${data.enquirerName}.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      logger.error('Failed to send enquiry email', { error, data });
      throw new Error('Failed to send email');
    }

    logger.info('Property enquiry email sent', {
      propertyTitle: data.propertyTitle,
      agentEmail: data.agentEmail,
      enquirerEmail: data.enquirerEmail,
    });

    return { success: true };
  } catch (error) {
    logger.error('Error sending property enquiry email', { error, data });
    throw error;
  }
}
