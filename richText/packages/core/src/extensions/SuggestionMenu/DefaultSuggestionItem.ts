import type { Dictionary } from "../../i18n/dictionary.js";

export type DefaultSuggestionItem = {
  key: keyof Dictionary["slash_menu"];
  title: string;
  onItemClick: () => void;
  subtext?: string;
  badge?: string;
  aliases?: string[];
  group?: string;
};
