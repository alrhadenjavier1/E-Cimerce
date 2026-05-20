// src/lib/emailjs.ts (UPDATED)
import emailjs from '@emailjs/browser';

export const EMAILJS_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID_CONFIRMATION: import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMATION,
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export const sendConfirmationEmail = async (userEmail: string, userName: string, confirmationCode: string) => {
  try {
    // Log to verify config (remove in production)
    console.log('EmailJS Config:', {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID_CONFIRMATION,
      hasPublicKey: !!EMAILJS_CONFIG.PUBLIC_KEY
    });

    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      confirmation_code: confirmationCode,
      from_name: 'Bowdeluxe',
      year: new Date().getFullYear(),
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_CONFIRMATION,
      templateParams
    );
    
    console.log('Confirmation email sent:', response);
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return { success: false, error };
  }
};

// Optional: Test email function
export const testEmailService = async () => {
  try {
    const result = await sendConfirmationEmail(
      'your-test-email@gmail.com', // Replace with your email
      'Test User',
      '123456'
    );
    console.log('Test result:', result);
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error };
  }
};