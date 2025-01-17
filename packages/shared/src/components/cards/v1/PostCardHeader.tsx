import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import OptionsButton from '../../buttons/OptionsButton';
import { CardHeader } from './Card';
import { ReadArticleButton } from '../ReadArticleButton';
import { getGroupedHoverContainer } from '../common';
import { useFeedPreviewMode } from '../../../hooks';
import { Post, PostType } from '../../../graphql/posts';
import { ButtonVariant } from '../../buttons/ButtonV2';
import PostMetadata, { PostMetadataProps } from './PostMetadata';
import MenuIcon from '../../icons/Menu';
import OpenLinkIcon from '../../icons/OpenLink';
import { useReadPostButtonText } from './hooks';

interface CardHeaderProps {
  post: Post;
  className?: string;
  children?: ReactNode;
  onMenuClick?: (e: React.MouseEvent) => void;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  postLink?: string;
  openNewTab?: boolean;
  metadata?: {
    topLabel?: PostMetadataProps['topLabel'];
    bottomLabel?: PostMetadataProps['bottomLabel'];
  };
}

const Container = getGroupedHoverContainer('span');

export const PostCardHeader = ({
  post,
  className,
  onMenuClick,
  onReadArticleClick,
  children,
  postLink,
  openNewTab,
  metadata,
}: CardHeaderProps): ReactElement => {
  const isFeedPreview = useFeedPreviewMode();
  const postButtonText = useReadPostButtonText(post);
  const isCollectionType = post.type === 'collection';
  const showCTA =
    !isFeedPreview &&
    [PostType.Article, PostType.VideoYouTube].includes(post.type);

  return (
    <CardHeader className={className}>
      {children}
      <PostMetadata
        className={classNames(
          'mr-2 flex-1',
          !isCollectionType && 'ml-4',
          isCollectionType && 'ml-2',
        )}
        createdAt={post.createdAt}
        {...metadata}
      />
      <Container
        className="relative ml-auto flex flex-row"
        data-testid="cardHeaderActions"
      >
        {!isFeedPreview && (
          <>
            {showCTA && (
              <ReadArticleButton
                content={postButtonText}
                className="mr-2"
                variant={ButtonVariant.Tertiary}
                icon={<OpenLinkIcon />}
                href={postLink}
                onClick={onReadArticleClick}
                openNewTab={openNewTab}
              />
            )}
            <OptionsButton
              icon={<MenuIcon className="rotate-90" />}
              onClick={onMenuClick}
              tooltipPlacement="top"
            />
          </>
        )}
      </Container>
    </CardHeader>
  );
};
