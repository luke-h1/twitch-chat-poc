import styled from "@emotion/styled";
import { useAppSelector } from "@frontend/store/hooks";
import { badgesSelector } from "@frontend/store/selectors/badges";
import { MessageTypePrivate } from "@frontend/types/messages";
import createHtmlBadge from "@frontend/util/createHtmlBadge";

interface Props {
  badges: MessageTypePrivate["badges"];
}

const Badge = styled.img<{ $bgColor?: string | null }>`
  margin-bottom: 2px;
  margin-right: 3px;
  max-width: 100%;
  vertical-align: middle;
  border-radius: 3px;
  background-color: ${(p) => p.$bgColor || "transparent"};
`;

const Badges = ({ badges }: Props) => {
  const allBadges = useAppSelector(badgesSelector);

  if (badges.length === 0) return null;

  const htmlBadges = badges
    .map((badge) => createHtmlBadge(allBadges, badge)!)
    .filter(Boolean);

  return (
    <>
      {htmlBadges.map(({ id, title, alt, src, srcSet, bgColor }) => (
        <Badge
          key={id}
          title={title}
          alt={alt}
          src={src}
          srcSet={srcSet}
          $bgColor={bgColor}
        />
      ))}{" "}
    </>
  );
};
export default Badges;
