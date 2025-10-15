export type CommunicationType = 'AI Voice' | 'Chatbot' | 'WhatsApp' | 'Recruiter Call';

export interface CommunicationEvent {
  type: CommunicationType;
  message: string;
  timestamp: string;
}
