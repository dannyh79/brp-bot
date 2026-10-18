/** Formatting supported by this bot. See https://core.telegram.org/bots/api#messageentity. */
export type TelegramFormat = { type: 'bold' | 'blockquote' } | { type: 'text_link'; url: string };

export type TelegramMessageEntity = TelegramFormat & { offset: number; length: number };

export type TelegramMessage = {
  text: string;
  entities: TelegramMessageEntity[];
};
