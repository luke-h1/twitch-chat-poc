import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";
import { AllEmotes, HtmlEmote } from "../slices/emotes/types";
import { BttvEmote } from "@frontend/types/bttv/emote";
import { MessagePartType } from "@frontend/types/messages";
import { StvEmote } from "@frontend/types/stv";
import { FfzEmote } from "@frontend/types/ffz/emote";
import createHtmlEmote from "@frontend/util/createHtmlEmote";

export type EmotesCategory = {
  title?: string;
  items: HtmlEmote[];
};

const createEmoteCategories = (emotes: AllEmotes) => {
  const result: EmotesCategory[] = [];

  const {
    twitch,
    bttvGlobal,
    bttvChannel,
    ffzGlobal,
    ffzChannel,
    stvGlobal,
    stvChannel,
  } = emotes;

  const createBttvHtmlEmote = (emote: BttvEmote) =>
    createHtmlEmote(emotes, MessagePartType.BTTV_EMOTE, emote.id)!;
  const createFfzHtmlEmote = (emote: FfzEmote) =>
    createHtmlEmote(emotes, MessagePartType.FFZ_EMOTE, `${emote.id}`)!;
  const createStvHtmlEmote = (emote: StvEmote) =>
    createHtmlEmote(emotes, MessagePartType.STV_EMOTE, emote.id)!;

  if (bttvChannel) {
    result.push({
      title: "BetterTTV Channel Emotes",
      items: Object.values(bttvChannel.entries).map(createBttvHtmlEmote),
    });
  }

  if (bttvGlobal) {
    result.push({
      title: "BetterTTV Global Emotes",
      items: Object.values(bttvGlobal.entries).map(createBttvHtmlEmote),
    });
  }

  if (ffzChannel) {
    result.push({
      title: "FrankerFaceZ Channel Emotes",
      items: Object.values(ffzChannel.entries).map(createFfzHtmlEmote),
    });
  }

  if (ffzGlobal) {
    result.push({
      title: "FrankerFaceZ Global Emotes",
      items: Object.values(ffzGlobal.entries).map(createFfzHtmlEmote),
    });
  }

  if (stvChannel) {
    result.push({
      title: "7TV Channel Emotes",
      items: Object.values(stvChannel.entries).map(createStvHtmlEmote),
    });
  }

  if (stvGlobal) {
    result.push({
      title: "7TV Global Emotes",
      items: Object.values(stvGlobal.entries).map(createStvHtmlEmote),
    });
  }

  if (twitch) {
    const user: HtmlEmote[] = [];
    const global: HtmlEmote[] = [];

    for (const emote of Object.values(twitch.entries)) {
      // skip duplicated variations of smile emotes
      if (emote.owner_id === "twitch") continue;

      const htmlEmote = createHtmlEmote(
        emotes,
        MessagePartType.TWITCH_EMOTE,
        emote.id
      )!;

      if (emote.emote_set_id === "0") {
        global.push(htmlEmote);
      } else {
        user.push(htmlEmote);
      }
    }

    result.push({ title: "Twitch User Emotes", items: user });
    result.push({ title: "Twitch Global Emotes", items: global });
  }

  return result;
};

export default createEmoteCategories;

export const emotesSelector = createSelector(
  (state: RootState) => state.chat.emotes.twitch.data,
  (state: RootState) => state.chat.emotes.twitch.template,
  (state: RootState) => state.chat.emotes.bttv.data,
  (state: RootState) => state.chat.emotes.ffz.data,
  (state: RootState) => state.chat.emotes.stv.data,
  (state: RootState) => state.chat.emotes.emoji.data,
  (state: RootState) =>
    state.chat.channels.entities[state.chat.currentChannel!]?.emotes.bttv.data,
  (state: RootState) =>
    state.chat.channels.entities[state.chat.currentChannel!]?.emotes.ffz.data,
  (state: RootState) =>
    state.chat.channels.entities[state.chat.currentChannel!]?.emotes.stv.data,
  (
    twitch,
    twitchTemplate,
    bttvGlobal,
    ffzGlobal,
    stvGlobal,
    emoji,
    bttvChannel,
    ffzChannel,
    stvChannel
  ): AllEmotes => ({
    twitch,
    twitchTemplate,
    bttvGlobal,
    ffzGlobal,
    stvGlobal,
    emoji,
    bttvChannel,
    ffzChannel,
    stvChannel,
  })
);

export const emoteCategoriesSelector = createSelector(
  emotesSelector,
  createEmoteCategories
);
