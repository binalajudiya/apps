import React, { ReactElement, useContext, useMemo } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import useFeedSettings from '../hooks/useFeedSettings';
import useReportPost from '../hooks/useReportPost';
import { Post, UserPostVote, isVideoPost } from '../graphql/posts';
import TrashIcon from './icons/Trash';
import HammerIcon from './icons/Hammer';
import EyeIcon from './icons/Eye';
import BlockIcon from './icons/Block';
import FlagIcon from './icons/Flag';
import { ReportedCallback } from './modals';
import useTagAndSource from '../hooks/useTagAndSource';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { MenuIcon } from './MenuIcon';
import { ToastSubject, useFeedLayout, useToastNotification } from '../hooks';
import {
  AllFeedPages,
  generateQueryKey,
  updateCachedPagePost,
} from '../lib/query';
import AuthContext from '../contexts/AuthContext';
import { ShareBookmarkProps } from './post/PostActions';
import BookmarkIcon from './icons/Bookmark';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { usePostMenuActions } from '../hooks/usePostMenuActions';
import { PinIcon } from './icons';
import { getPostByIdKey } from '../hooks/usePostById';
import EditIcon from './icons/Edit';
import UpvoteIcon from './icons/Upvote';
import DownvoteIcon from './icons/Downvote';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { labels } from '../lib';
import { MenuItemProps } from './fields/PortalMenu';
import SendBackwardIcon from './icons/SendBackward';
import BringForwardIcon from './icons/BringForward';
import {
  mutateBookmarkFeedPost,
  useBookmarkPost,
} from '../hooks/useBookmarkPost';
import { ActiveFeedContext } from '../contexts';
import { useAdvancedSettings } from '../hooks/feed';
import PlusIcon from './icons/Plus';
import { useFeature } from './GrowthBookProvider';
import { feature } from '../lib/featureManagement';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
  {
    ssr: false,
  },
);

export interface PostOptionsMenuProps extends ShareBookmarkProps {
  postIndex?: number;
  post: Post;
  prevPost?: Post;
  nextPost?: Post;
  feedName?: AllFeedPages;
  onHidden?: () => unknown;
  onBookmark?: () => unknown;
  onRemovePost?: (postIndex: number) => Promise<unknown>;
  setShowBanPost?: () => unknown;
  setShowPromotePost?: () => unknown;
  contextId?: string;
  origin: Origin;
  allowPin?: boolean;
  isOpen?: boolean;
}

export default function PostOptionsMenu({
  postIndex,
  post,
  prevPost,
  nextPost,
  feedName,
  onHidden,
  onRemovePost,
  setShowBanPost,
  setShowPromotePost,
  origin,
  allowPin,
  isOpen,
  contextId = 'post-context',
}: PostOptionsMenuProps): ReactElement {
  const client = useQueryClient();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { displayToast } = useToastNotification();
  const { feedSettings, advancedSettings, checkSettingsEnabledState } =
    useFeedSettings({ enabled: isOpen });
  const { onUpdateSettings } = useAdvancedSettings({ enabled: false });
  const { trackEvent } = useContext(AnalyticsContext);
  const { hidePost, unhidePost } = useReportPost();
  const { openModal } = useLazyModal();
  const { queryKey: feedQueryKey, items } = useContext(ActiveFeedContext);
  const {
    onFollowSource,
    onUnfollowSource,
    onFollowTags,
    onBlockTags,
    onUnblockTags,
  } = useTagAndSource({
    origin: Origin.PostContextMenu,
    postId: post?.id,
    shouldInvalidateQueries: false,
  });

  const { toggleBookmark } = useBookmarkPost({
    mutationKey: feedQueryKey,
    onMutate: feedQueryKey
      ? ({ id }) => {
          const updatePost = updateCachedPagePost(
            feedQueryKey as unknown[],
            client,
          );

          return mutateBookmarkFeedPost({ id, items, updatePost });
        }
      : undefined,
  });

  const onToggleBookmark = async () => {
    toggleBookmark({ post, origin });
  };

  const showMessageAndRemovePost = async (
    message: string,
    _postIndex: number,
    undo?: () => unknown,
  ) => {
    const onUndo = async () => {
      await undo?.();
      client.invalidateQueries(generateQueryKey(feedName, user));
    };
    displayToast(message, {
      subject: ToastSubject.Feed,
      onUndo: undo !== null ? onUndo : null,
    });
    onRemovePost?.(_postIndex);
  };
  const {
    onConfirmDeletePost,
    onPinPost,
    onSwapPinnedPost,
    onToggleDownvotePost,
  } = usePostMenuActions({
    post,
    postIndex,
    onPinSuccessful: async () => {
      const key = getPostByIdKey(post.id);
      const cached = client.getQueryData(key);
      if (cached) {
        client.setQueryData<Post>(key, (data) => ({
          ...data,
          pinnedAt: post.pinnedAt ? null : new Date(),
        }));
      }

      await client.invalidateQueries(feedQueryKey);
      displayToast(
        post.pinnedAt
          ? 'Your post has been unpinned'
          : '📌 Your post has been pinned',
      );
    },
    onSwapPostSuccessful: async () => {
      await client.invalidateQueries(feedQueryKey);
    },
    onPostDeleted: ({ index, post: deletedPost }) => {
      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.DeletePost, deletedPost, {
          extra: { origin },
        }),
      );
      return showMessageAndRemovePost('The post has been deleted', index, null);
    },
    origin,
  });

  const onReportedPost: ReportedCallback = async (
    reportedPost,
    { index, shouldBlockSource },
  ): Promise<void> => {
    showMessageAndRemovePost(labels.reporting.reportFeedbackText, index);

    if (shouldBlockSource) {
      await onUnfollowSource({ source: reportedPost?.source });
    }
  };

  const onBlockSource = async (): Promise<void> => {
    const { successful } = await onUnfollowSource({
      source: post?.source,
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    showMessageAndRemovePost(
      `🚫 ${post?.source?.name} blocked`,
      postIndex,
      () => onFollowSource({ source: post?.source }),
    );
  };

  const onUnblockSource = async (): Promise<void> => {
    const { successful } = await onFollowSource({
      source: post?.source,
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    displayToast(`${post?.source?.name} unblocked`, {
      subject: ToastSubject.Feed,
    });
  };

  const onBlockTag = async (tag: string): Promise<void> => {
    const { successful } = await onBlockTags({
      tags: [tag],
      requireLogin: true,
    });

    if (!successful) {
      return;
    }

    const isTagFollowed = feedSettings?.includeTags?.indexOf(tag) !== -1;
    const undoAction = isTagFollowed ? onFollowTags : onUnblockTags;
    await showMessageAndRemovePost(`⛔️ #${tag} blocked`, postIndex, () =>
      undoAction({ tags: [tag], requireLogin: true }),
    );
  };
  const video = advancedSettings?.find(({ title }) => title === 'Videos');
  const onToggleVideo = async () => {
    const isEnabled = checkSettingsEnabledState(video?.id);
    const icon = isEnabled ? '⛔️' : '✅';
    const label = isEnabled ? 'blocked' : 'unblocked';
    await onUpdateSettings(video.id, !isEnabled);
    await showMessageAndRemovePost(
      `${icon} Video content ${label}`,
      postIndex,
      () => onUpdateSettings(video.id, isEnabled),
    );
  };

  const onHidePost = async (): Promise<void> => {
    const { successful } = await hidePost(post.id);

    if (!successful) {
      return;
    }

    trackEvent(
      postAnalyticsEvent('hide post', post, {
        extra: { origin: Origin.PostContextMenu },
      }),
    );

    showMessageAndRemovePost(
      '🙈 This post won’t show up on your feed anymore',
      postIndex,
      () => unhidePost(post.id),
    );
  };

  const isSourceBlocked = useMemo(() => {
    return !!feedSettings?.excludeSources?.some(
      (excludedSource) => excludedSource.id === post?.source?.id,
    );
  }, [feedSettings?.excludeSources, post?.source?.id]);

  const postOptions: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={EyeIcon} />,
      label: 'Hide',
      action: onHidePost,
    },
  ];

  const { shouldUseFeedLayoutV1 } = useFeedLayout();
  const bookmarkOnCard = useFeature(feature.bookmarkOnCard);

  if (!bookmarkOnCard && !shouldUseFeedLayoutV1) {
    postOptions.push({
      icon: (
        <MenuIcon
          secondary={post?.bookmarked}
          Icon={BookmarkIcon}
          className={post?.bookmarked && 'text-theme-color-bun'}
        />
      ),
      label: `${post?.bookmarked ? 'Remove from' : 'Save to'} bookmarks`,
      action: onToggleBookmark,
    });
  }

  if (!shouldUseFeedLayoutV1) {
    postOptions.push({
      icon: (
        <MenuIcon
          className={classNames(
            post?.userState?.vote === UserPostVote.Down &&
              'text-theme-color-ketchup',
          )}
          Icon={DownvoteIcon}
          secondary={post?.userState?.vote === UserPostVote.Down}
        />
      ),
      label: 'Downvote',
      action: onToggleDownvotePost,
    });
  }

  postOptions.push({
    icon: <MenuIcon Icon={BlockIcon} />,
    label: isSourceBlocked
      ? `Show posts from ${post?.source?.name}`
      : `Don't show posts from ${post?.source?.name}`,
    action: isSourceBlocked ? onUnblockSource : onBlockSource,
  });

  if (video && isVideoPost(post)) {
    const isEnabled = checkSettingsEnabledState(video.id);
    const label = isEnabled ? `Don't show` : 'Show';
    postOptions.push({
      icon: <MenuIcon Icon={isEnabled ? BlockIcon : PlusIcon} />,
      label: `${label} video content`,
      action: onToggleVideo,
    });
  }

  post?.tags?.forEach((tag) => {
    if (tag.length) {
      const isBlocked = feedSettings?.blockedTags?.includes(tag);
      postOptions.push({
        icon: <MenuIcon Icon={isBlocked ? PlusIcon : BlockIcon} />,
        label: isBlocked ? `Follow #${tag}` : `Not interested in #${tag}`,
        action: () => onBlockTag(tag),
      });
    }
  });

  postOptions.push({
    icon: <MenuIcon Icon={FlagIcon} />,
    label: 'Report',
    action: async () =>
      openModal({
        type: LazyModal.ReportPost,
        props: {
          index: postIndex,
          post,
          onReported: onReportedPost,
          origin: Origin.PostContextMenu,
        },
      }),
  });
  if (user?.id && post?.author?.id === user?.id) {
    postOptions.push({
      icon: <MenuIcon Icon={EditIcon} />,
      label: 'Edit post',
      action: () => router.push(`${post.commentsPermalink}/edit`),
    });
  }
  if (onConfirmDeletePost) {
    postOptions.push({
      icon: <MenuIcon Icon={TrashIcon} />,
      label: 'Delete post',
      action: onConfirmDeletePost,
    });
  }

  if (allowPin && onSwapPinnedPost) {
    if (nextPost?.pinnedAt) {
      postOptions.unshift({
        icon: <MenuIcon Icon={SendBackwardIcon} secondary={!!post.pinnedAt} />,
        label: 'Send backward',
        action: () => onSwapPinnedPost({ swapWithId: nextPost.id }),
      });
    }

    if (prevPost?.pinnedAt) {
      postOptions.unshift({
        icon: <MenuIcon Icon={BringForwardIcon} secondary={!!post.pinnedAt} />,
        label: 'Bring forward',
        action: () => onSwapPinnedPost({ swapWithId: prevPost.id }),
      });
    }
  }

  if (allowPin && onPinPost) {
    postOptions.unshift({
      icon: <MenuIcon Icon={PinIcon} secondary={!!post.pinnedAt} />,
      label: post.pinnedAt ? 'Unpin from top' : 'Pin to top',
      action: onPinPost,
    });
  }

  if (setShowBanPost) {
    postOptions.push({
      icon: <MenuIcon Icon={HammerIcon} />,
      label: 'Ban',
      action: setShowBanPost,
    });
  }
  if (setShowPromotePost) {
    const promoteFlag = post.flags?.promoteToPublic;
    postOptions.push({
      icon: <MenuIcon Icon={promoteFlag ? DownvoteIcon : UpvoteIcon} />,
      label: promoteFlag ? 'Demote' : 'Promote',
      action: setShowPromotePost,
    });
  }

  return (
    <>
      <PortalMenu
        disableBoundariesCheck
        id={contextId}
        className="menu-primary"
        animation="fade"
        onHidden={onHidden}
      >
        {postOptions.map(({ icon, label, action }) => (
          <Item key={label} className="typo-callout" onClick={action}>
            <span className="flex w-full items-center typo-callout">
              {icon} {label}
            </span>
          </Item>
        ))}
      </PortalMenu>
    </>
  );
}
