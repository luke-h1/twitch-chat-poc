import { SuggestionState } from "@frontend/store/slices/chat/types";
import { HtmlEmote } from "@frontend/store/slices/emotes/types";

export default function replaceSuggestionText(
  text: string,
  { activeIndex, end, isActive, items, start, type }: SuggestionState
): string {
  if (items.length === 0) {
    return text;
  }

  const currentItem = items[activeIndex];

  const insertedText =
    type === "users" ? `@${currentItem}` : (currentItem as HtmlEmote).alt;

  const textBefore = text.substring(0, start);
  const textAfter = text.substring(end) || "";

  return `${textBefore}${insertedText}${textAfter}`;
}
