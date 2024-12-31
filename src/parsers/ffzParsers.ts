import { Emoji } from "@frontend/store/slices/emotes/types";
import {
  FfzChannelEmotesResponse,
  FfzEmojiResponse,
  FfzEmote,
  FfzGlobalEmotesResponse,
} from "@frontend/types/ffz/emote";
import { Emote } from "@frontend/types/util";

export const parseFfzGlobalEmotes = ({
  default_sets: defaultSets,
  sets,
}: FfzGlobalEmotesResponse): Emote<FfzEmote> => {
  const result: Emote<FfzEmote> = { entries: {}, names: {} };

  for (const setId of defaultSets) {
    for (const emote of sets[setId].emoticons) {
      result.entries[emote.id] = emote;
      result.names[emote.name] = emote.id.toString();
    }
  }
  return result;
};

export const parseFfzChannelEmotes = ({
  room,
  sets,
}: FfzChannelEmotesResponse): Emote<FfzEmote> => {
  const result: Emote<FfzEmote> = { entries: {}, names: {} };

  for (const emote of sets[room.set].emoticons) {
    result.entries[emote.id] = emote;
    result.names[emote.name] = emote.id.toString();
  }

  return result;
};

const codePointsToString = (codePoints: string): string => {
  return String.fromCodePoint(
    ...codePoints.split("-").map((s) => parseInt(s, 16))
  );
};

// https://github.com/FrankerFaceZ/FrankerFaceZ/blob/master/src/modules/chat/emoji.js#L305
const hasInTwitter = (has: number) => 0b0010 & has;

export const parseFfzEmoji = ({
  e: emojis,
}: FfzEmojiResponse): Emote<Emoji> => {
  const result: Emote<Emoji> = { entries: {}, names: {} };
  // const names: string[] = [];

  const addToNames = (
    char: string,
    name: string | string[],
    codePoints: string
  ) => {
    result.names[char] = codePoints;

    if (Array.isArray(name)) {
      for (const n of name) result.names[`:${n}:`] = codePoints;
      // for (const n of name) names.push(n);
    } else {
      result.names[`:${name}:`] = codePoints;
      // names.push(name);
    }
  };

  // @ts-expect-error - symbol iterator
  for (const [category, sort, name, , codePoints, , has, variants] of emojis) {
    if (!hasInTwitter(has)) continue;

    const char = codePointsToString(codePoints);

    addToNames(char, name, codePoints);

    result.entries[codePoints] = {
      category,
      sort,
      char,
      name,
      codePoints,
      // @ts-expect-error - codePoints inferred as any
      variants: variants ? variants.map(([codePoints]) => codePoints) : [],
    };

    if (Array.isArray(variants)) {
      for (const [codePoints, , , , , name] of variants) {
        const char = codePointsToString(codePoints);

        addToNames(char, name, codePoints);

        result.entries[codePoints] = {
          category: -1,
          sort: -1,
          char,
          name,
          codePoints,
          variants: [],
        };
      }
    }
  }

  return result;
};
