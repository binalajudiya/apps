import React, { ReactElement, useContext } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import { Post } from '../graphql/posts';
import ShareIcon from './icons/Share';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import { ShareBookmarkProps } from './post/PostActions';
import BookmarkIcon from './icons/Bookmark';
import { Origin } from '../lib/analytics';
import { ShareProvider } from '../lib/share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import LinkIcon from './icons/Link';
import { useFeature } from './GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { useFeedLayout } from '../hooks';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  { ssr: false },
);

interface ShareOptionsMenuProps extends ShareBookmarkProps {
  post: Post;
  onHidden?: () => unknown;
  onBookmark?: () => unknown;
  contextId?: string;
}

type ShareOption = {
  href?: string;
  icon: ReactElement;
  text: string;
  action: () => unknown;
};

export default function ShareOptionsMenu({
  onShare,
  onBookmark,
  post,
  onHidden,
  contextId = 'share-context',
}: ShareOptionsMenuProps): ReactElement {
  const link = post && post?.commentsPermalink;
  const [, copyLink] = useCopyPostLink(link);
  const { trackEvent } = useContext(AnalyticsContext);
  const onClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );

  const trackAndCopyLink = () => {
    copyLink();
    onClick(ShareProvider.CopyLink);
  };

  const bookmarkOnCard = useFeature(feature.bookmarkOnCard);
  const { shouldUseFeedLayoutV1 } = useFeedLayout();

  const shareOptions: ShareOption[] = [
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      text: 'Share post via...',
      action: () => onShare(post),
    },
  ];

  if (!bookmarkOnCard && !shouldUseFeedLayoutV1) {
    shareOptions.push({
      icon: (
        <MenuIcon
          secondary={post?.bookmarked}
          Icon={BookmarkIcon}
          className={post?.bookmarked && 'text-theme-color-bun'}
        />
      ),
      text: `${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`,
      action: onBookmark,
    });
  }

  shareOptions.push({
    icon: <MenuIcon Icon={LinkIcon} />,
    text: 'Copy link to post',
    action: trackAndCopyLink,
  });

  return (
    <PortalMenu
      disableBoundariesCheck
      id={contextId}
      className="menu-primary"
      animation="fade"
      onHidden={onHidden}
    >
      {shareOptions.map(({ href, icon, text, action }) => (
        <Item key={text} className="w-64 py-1 typo-callout" onClick={action}>
          {href ? (
            <a
              className="flex w-full items-center typo-callout"
              data-testid={`social-share-${text}`}
              href={href}
              rel="noopener"
              target="_blank"
            >
              {icon} {text}
            </a>
          ) : (
            <span className="flex w-full items-center typo-callout">
              {icon} {text}
            </span>
          )}
        </Item>
      ))}
    </PortalMenu>
  );
}
