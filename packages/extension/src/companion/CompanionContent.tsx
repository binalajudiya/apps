import React, { ReactElement, useContext, useState } from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import CopyIcon from '@dailydotdev/shared/src/components/icons/Copy';
import {
  HotLabel,
  TLDRText,
} from '@dailydotdev/shared/src/components/utilities';
import '@dailydotdev/shared/src/styles/globals.css';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopy';
import { useUpvoteQuery } from '@dailydotdev/shared/src/hooks/useUpvoteQuery';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { CompanionEngagements } from './CompanionEngagements';
import { CompanionDiscussion } from './CompanionDiscussion';
import { useBackgroundPaginatedRequest } from './useBackgroundPaginatedRequest';

type CompanionContentProps = {
  post: PostBootData;
};

const COMPANION_TOP_OFFSET_PX = 120;

export default function CompanionContent({
  post,
}: CompanionContentProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [copying, copyLink] = useCopyLink(() => post.commentsPermalink);
  const [heightPx, setHeightPx] = useState('0');
  const { queryKey, onShowUpvoted } = useUpvoteQuery();
  useBackgroundPaginatedRequest(queryKey);

  const trackAndCopyLink = () => {
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider: ShareProvider.CopyLink, origin: Origin.Companion },
      }),
    );
    copyLink();
  };

  const onContainerChange = async (el: HTMLElement) => {
    if (!el) {
      return;
    }

    const { height } = el.getBoundingClientRect();
    const px = `${height + COMPANION_TOP_OFFSET_PX}px`;
    setHeightPx(px);
  };

  return (
    <div
      ref={onContainerChange}
      className="relative flex h-auto w-[22.5rem] flex-col rounded-tl-16 border border-r-0 border-theme-divider-quaternary bg-theme-bg-primary p-6"
    >
      <div className="flex flex-row items-center gap-3">
        <a href={process.env.NEXT_PUBLIC_WEBAPP_URL} target="_parent">
          <LogoIcon className="w-8 rounded-8" />
        </a>
        {post?.trending && <HotLabel />}
        <SimpleTooltip
          placement="top"
          content="Copy link"
          appendTo="parent"
          container={{ className: 'shadow-2 whitespace-nowrap' }}
        >
          <Button
            icon={<CopyIcon />}
            variant={ButtonVariant.Tertiary}
            color={copying ? ButtonColor.Avocado : undefined}
            className="ml-auto"
            onClick={trackAndCopyLink}
          />
        </SimpleTooltip>
      </div>
      <p className="my-4 flex-1 break-words typo-callout">
        <TLDRText>TLDR -</TLDRText>
        <span>
          {post?.summary ||
            `Oops, edge case alert! Our AI-powered TLDR engine couldn't generate a summary for this article. Anyway, we thought it would be an excellent reminder for us all to strive for progress over perfection! Be relentless about learning, growing, and improving. Sometimes shipping an imperfect feature is better than not shipping at all. Enjoy the article!`}
        </span>
      </p>
      <CompanionEngagements
        post={post}
        onUpvotesClick={() => onShowUpvoted(post.id, post.numUpvotes)}
      />
      <CompanionDiscussion
        style={{ maxHeight: `calc(100vh - ${heightPx})` }}
        post={post}
        onShowUpvoted={(id, count) => onShowUpvoted(id, count, 'comment')}
      />
    </div>
  );
}
