import storageService from "@frontend/services/localStorageService";
import { LocalStorageEmoteUsageStatistic } from "@frontend/store/slices/emotes/types";
import {
  MessagePartType,
  MessagePartEmote,
  MessagePart,
} from "@frontend/types/messages";

const EMOTE_TYPES: MessagePartType[] = [
  MessagePartType.TWITCH_EMOTE,
  MessagePartType.BTTV_EMOTE,
  MessagePartType.FFZ_EMOTE,
  MessagePartType.STV_EMOTE,
];

export const readEmotesUsageStatistic = (): MessagePartEmote[] => {
  const stats = storageService.getSync("emoteUsageStatistics");
  if (!stats) return [];

  type Emote = MessagePartEmote & {
    uses: number;
    updatedAt: number;
  };
  const result: Emote[] = [];

  for (const [typeString, emotes] of Object.entries(stats)) {
    const type = Number.parseInt(typeString, 10) as MessagePartEmote["type"];

    for (const [id, [uses, updatedAt]] of Object.entries(emotes)) {
      result.push({ type, content: { id, modifiers: [] }, uses, updatedAt });
    }
  }

  result.sort((a, b) =>
    b.uses === a.uses ? b.updatedAt - a.updatedAt : b.uses - a.uses
  );

  return result.map(({ type, content }) => ({ type, content }));
};

export const writeEmotesUsageStatistic = (parts: MessagePart[]) => {
  if (parts.length === 0) return;

  const stats = storageService.getSync<LocalStorageEmoteUsageStatistic>(
    "emoteUsageStatistics"
  );

  for (const {
    type,
    content: { id },
  } of parts as MessagePartEmote[]) {
    const isEmote = EMOTE_TYPES.includes(type);
    if (!isEmote) continue;
    if (!stats[type]) stats[type] = {};
    const [prevUses] = stats[type][id] || [0];
    stats[type][id] = [prevUses + 1, Date.now()];
  }

  storageService.setSync("emoteUsageStatistics", stats);
};
