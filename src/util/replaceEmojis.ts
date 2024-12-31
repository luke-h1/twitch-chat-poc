import { AllEmotes } from "@frontend/store/slices/emotes/types";

/** Replaces :smile: with 😊 */
const replaceEmojis = (emojis: AllEmotes["emoji"], text: string) => {
  if (!emojis) return text;

  return text
    .split(" ")
    .map((word) => {
      if (!word.startsWith(":") && !word.endsWith(":")) return word;
      const id = emojis.names[word];
      return id ? emojis.entries[id].char : word;
    })
    .join(" ");
};

export default replaceEmojis;
