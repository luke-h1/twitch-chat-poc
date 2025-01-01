import { AllEmotes, HtmlEmote } from "@frontend/store/slices/emotes/types";
import { MessagePartType } from "@frontend/types/messages";
import createHtmlBadge from "./createHtmlBadge";
import createHtmlEmote from "./createHtmlEmote";

interface SearchResult {
  begins: HtmlEmote[];
  contains: HtmlEmote[];
}

function createFindEmotes<T, U extends keyof T, V extends keyof T>(
  emotes: AllEmotes,
  entries: Record<string, T> | undefined,
  nameProp: U,
  idProp: V,
  type: MessagePartType
) {
  return function (result: SearchResult, search: string, limit: number) {
    if (!entries) {
      return;
    }

    for (const emote of Object.values(entries)) {
      if (result.begins.length + result.contains.length === limit) {
        return true;
      }

      const index = (emote[nameProp] as unknown as string)
        .toLowerCase()
        .indexOf(search);

      if (index === -1) {
        continue;
      }
      result[index === 0 ? "begins" : "contains"].push(
        createHtmlEmote(emotes, type, emote[idProp] as never)!
      );
    }
  };
}

function createFindEmoji(emotes: AllEmotes) {
  return function (result: SearchResult, search: string, limit: number) {
    if (!emotes.emoji?.entries) {
      return;
    }

    for (const emote of Object.values(emotes.emoji.entries)) {
      if (result.begins.length + result.contains.length === limit) {
        return true;
      }

      if (typeof emote.name === "string") {
        const index = emote.name.toLowerCase().indexOf(search);
      }
    }
  };
}
