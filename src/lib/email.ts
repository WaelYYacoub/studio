/**
 * Email Notification Service for Gate Pass Management System
 * 
 * Sends automated emails to users when their accounts are approved.
 * Uses EmailJS - a free email service that doesn't require a backend.
 * 
 * Setup: https://www.emailjs.com
 */

import emailjs from '@emailjs/browser';

// ============================================
// 🔑 YOUR EMAILJS CREDENTIALS
// ============================================
const EMAILJS_SERVICE_ID = 'service_s3kl4pg';
const EMAILJS_TEMPLATE_ID = 'template_lievm0n';
const EMAILJS_PUBLIC_KEY = 'LT7Fsfg_39olLwVSz';

// ============================================
// 📧 EMAIL SENDING FUNCTION
// ============================================

/**
 * Sends an approval email to a user
 * 
 * @param userEmail - The user's email address (where to send)
 * @param userName - The user's full name
 * @param userRole - The role assigned (user, admin, etc.)
 * @returns Promise<boolean> - true if email sent successfully
 */
export async function sendApprovalEmail(
  userEmail: string,
  userName: string,
  userRole: string
): Promise<boolean> {
  
  try {
    console.log('📧 Sending approval email to:', userEmail);
    
    // Send email via EmailJS
    // IMPORTANT: Only send the 3 core parameters
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_name: userName,           // For email greeting
        to_email: userEmail,         // Recipient email address
        user_role: userRole,         // Their role (user/admin)
      },
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('✅ Email sent successfully:', response.status, response.text);
    return true;
    
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    
    // Log specific error details for debugging
    if (error.text) {
      console.error('Error details:', error.text);
    }
    if (error.status) {
      console.error('Error status:', error.status);
    }
    
    // Don't throw error - email failure shouldn't block approval
    return false;
  }
}