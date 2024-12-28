export interface Emoji {
  category: number;
  sort: number;
  char: string;
  name: string | string[];
  codePoints: string;
  variants: string[];
}

export interface AllEmotes {
  twitch?: Emotes<TwitchEmote>;
  twitchTemplate?: string;
  bttvGlobal?: Emotes<BttvEmote>;
  bttvChannel?: Emotes<BttvEmote>;
  ffzGlobal?: Emotes<FfzEmote>;
  ffzChannel?: Emotes<FfzEmote>;
  stvGlobal?: Emotes<StvEmote>;
  stvChannel?: Emotes<StvEmote>;
  emoji?: Emotes<Emoji>;
}
