/**
 * Contact channel types for lead capture
 */
export type ContactChannel = 'email' | 'telegram' | 'whatsapp' | 'phone';

/**
 * Lead form submission data
 */
export interface LeadFormData {
  name: string;
  email: string;
  company?: string;
  channel: ContactChannel;
  channelValue?: string;
  message?: string;
  consent: boolean;
}
