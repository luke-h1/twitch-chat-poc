/* eslint-disable react/jsx-key */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useAppSelector } from "@frontend/store/hooks";
import { emotesSelector } from "@frontend/store/selectors/emote";
import { HtmlEmote } from "@frontend/store/slices/emotes/types";
import { MessagePartEmote, MessagePartType } from "@frontend/types/messages";
import createHtmlEmote from "@frontend/util/createHtmlEmote";

const Wrapper = styled.span`
  display: inline;

  &[data-modified="true"] {
    ~ & {
      position: relative;
      z-index: 1;
    }

    position: relative;
    z-index: 0;

    span {
      position: absolute;
      top: -20px;
      bottom: -20px;
      left: -20px;
      right: -20px;
      margin: auto;
      pointer-events: none;

      img {
        position: absolute;
        top: 50%;
        left: 50%;
        padding: 0;
        margin: 0;
        pointer-events: none !important;
        transform: translate(-50%, -50%);
      }
    }
  }
`;
const imageCss = css`
  position: relative;
  margin: -5px 0;
  max-width: 100%;
  vertical-align: middle;
`;
const Modifier = styled.span``;
const Image = styled.img`
  ${imageCss};
`;
const ImageEmoji = styled.img`
  ${imageCss};

  --ffz-chat-font-size: 13px;

  width: 19.5px;
  height: 19.5px;
  width: calc(var(--ffz-chat-font-size) * 1.5);
  height: calc(var(--ffz-chat-font-size) * 1.5);
`;

const SmartEmote = ({ title, alt, src, srcSet, sources }: HtmlEmote) =>
  sources.length === 0 ? (
    <Image title={title} alt={alt} src={src} srcSet={srcSet} />
  ) : (
    <picture>
      {sources.map(([mimeType, sourceSrcSet]) => (
        <source srcSet={sourceSrcSet} type={mimeType} />
      ))}
      <Image title={title} alt={alt} src={src} srcSet={srcSet} />
    </picture>
  );

const Emoji = ({ title, alt, src, srcSet }: HtmlEmote) => (
  <ImageEmoji title={title} alt={alt} src={src} srcSet={srcSet} />
);

interface Props {
  emote: MessagePartEmote;
}

const Emote = ({ emote: { type, content } }: Props) => {
  const emotes = useAppSelector(emotesSelector);
  const htmlEmote = createHtmlEmote(emotes, type, content.id);

  if (!htmlEmote) return null;

  const renderModifiers = () =>
    content.modifiers
      .map((emote) => createHtmlEmote(emotes, emote.type, emote.content.id)!)
      .filter(Boolean)
      .map((htmlEmoteModifier) => (
        <Modifier key={htmlEmoteModifier.id}>
          <SmartEmote {...htmlEmoteModifier} />
        </Modifier>
      ));

  return (
    <Wrapper
      data-id={htmlEmote.id}
      data-modified={content.modifiers.length > 0}
    >
      {type === MessagePartType.EMOJI ? (
        <Emoji {...htmlEmote} />
      ) : (
        <SmartEmote {...htmlEmote} />
      )}
      {!!content.modifiers.length && renderModifiers()}
    </Wrapper>
  );
};
export default Emote;
