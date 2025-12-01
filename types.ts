export enum RecordType {
  TEXT = 'text',
  URL = 'url',
  JSON = 'json', // Mime type application/json
  WIFI = 'wifi', // Conceptual, actually a specific mime configuration usually
}

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
  GITHUB = 'github'
}

export interface NFCRecordData {
  id: string;
  type: RecordType;
  content: string; // The raw content or JSON string
  label?: string; // UI friendly label
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

// Global declaration for Web NFC API
declare global {
  interface Window {
    NDEFReader: any;
  }
}
