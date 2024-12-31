import { StvEmote, StvGlobalEmotesResponse } from "@frontend/types/stv";
import { Emote } from "@frontend/types/util";

export const parseStvGlobalEmotes = (
  data: StvGlobalEmotesResponse
): Emote<StvEmote> => {
  const result: Emote<StvEmote> = { entries: {}, names: {} };

  for (const emote of data.emotes) {
    result.entries[emote.id] = emote;
    result.names[emote.name] = emote.id;
  }
  return result;
};
