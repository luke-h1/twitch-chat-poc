import { useAppSelector } from "@frontend/store/hooks";
import { emotesSelector } from "@frontend/store/selectors/emote";
import { FREQUENTLY_USED_EMOTES_LIMIT } from "@frontend/store/slices/emotes/constants";
import createHtmlEmote from "@frontend/util/createHtmlEmote";
import { readEmotesUsageStatistic } from "@frontend/util/emoteUsageStatistics";
import { useState } from "react";

export default function useFrequentlyUsedEmotes() {
  const emotes = useAppSelector(emotesSelector);

  const [frequentlyUsedEmotes] = useState(() =>
    readEmotesUsageStatistic()
      .slice(0, FREQUENTLY_USED_EMOTES_LIMIT)
      .map(({ type, content }) => createHtmlEmote(emotes, type, content.id))
      .filter(Boolean)
  );

  return frequentlyUsedEmotes;
}
