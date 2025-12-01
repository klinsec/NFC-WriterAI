import { SocialPlatform } from './types';

export const SOCIAL_PREFIXES: Record<SocialPlatform, string> = {
  [SocialPlatform.INSTAGRAM]: 'https://instagram.com/',
  [SocialPlatform.TWITTER]: 'https://twitter.com/',
  [SocialPlatform.LINKEDIN]: 'https://linkedin.com/in/',
  [SocialPlatform.YOUTUBE]: 'https://youtube.com/@',
  [SocialPlatform.TIKTOK]: 'https://tiktok.com/@',
  [SocialPlatform.GITHUB]: 'https://github.com/',
};

export const SOCIAL_ICONS: Record<SocialPlatform, string> = {
  [SocialPlatform.INSTAGRAM]: '📸',
  [SocialPlatform.TWITTER]: '🐦',
  [SocialPlatform.LINKEDIN]: '💼',
  [SocialPlatform.YOUTUBE]: '📺',
  [SocialPlatform.TIKTOK]: '🎵',
  [SocialPlatform.GITHUB]: '🐙',
};

// Common Gemini Prompt for Tag Generation
export const TAG_GENERATION_SYSTEM_PROMPT = `
You are a creative assistant for an NFC Tag writing app.
Users will ask for content to put on an NFC tag.
Your goal is to generate short, clever, or functional content suitable for:
1. Plain text messages (jokes, wifi passwords, clues).
2. URLs (rickrolls, useful tools).
3. JSON data (business cards).

Return ONLY the raw content string that should be written to the tag.
If the user asks for a JSON business card, return valid JSON.
Keep it concise.
`;
