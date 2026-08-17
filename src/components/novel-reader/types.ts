export type NovelChapter = {
  id?: string | number;
  title?: string;
  content?: string;
};

export type NovelProgress = {
  chapterIndex: number;
  paragraphIndex: number;
  offset?: number;
};

export type NovelBookmark = {
  chapterIndex: number;
  paragraphIndex: number;
  text: string;
  time?: number;
};

export type NovelThemeName = 'day' | 'night' | 'sepia';

export type NovelThemeTokens = {
  background: string;
  text: string;
  muted: string;
};

export type NovelReaderSettings = {
  theme: NovelThemeName;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  contentWidth: string;
  fontFamily: string;
  fontWeight: number;
  animation: boolean;
};

export type NovelReaderError = {
  message?: string;
  chapterIndex?: number;
};

export const NOVEL_DEFAULT_SETTINGS: NovelReaderSettings = {
  theme: 'day',
  fontSize: 18,
  lineHeight: 1.8,
  paragraphSpacing: 16,
  contentWidth: '92%',
  fontFamily: 'system',
  fontWeight: 400,
  animation: true,
};

export const NOVEL_THEME_TOKENS: Record<NovelThemeName, NovelThemeTokens> = {
  day: { background: '#ffffff', text: '#303133', muted: '#909399' },
  night: { background: '#1e1e1e', text: '#dcdcdc', muted: '#8a8a8a' },
  sepia: { background: '#f5ecd7', text: '#5b4636', muted: '#a08c74' },
};
