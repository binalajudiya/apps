import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ownershipGuide } from '../../lib/constants';
import FeatherIcon from '../icons/Feather';
import styles from './AuthorOnboarding.module.css';
import { IconSize } from '../Icon';
import { Button, ButtonVariant } from '../buttons/ButtonV2';

interface AuthorOnboardingProps {
  onSignUp?: () => unknown;
}

function AuthorOnboarding({ onSignUp }: AuthorOnboardingProps): ReactElement {
  return (
    <section
      className={classNames(
        'mb-6 rounded-2xl bg-theme-bg-secondary p-6',
        styles.authorOnboarding,
      )}
    >
      <div
        className={classNames(
          'grid items-center gap-x-3',
          styles.authorOnboardingHeader,
        )}
        style={{ gridTemplateColumns: 'repeat(2, max-content)' }}
      >
        <FeatherIcon
          secondary
          size={IconSize.XLarge}
          className="icon text-theme-status-help"
        />
        <h3>Author</h3>
        <h2>Is this post yours?</h2>
      </div>
      <p>Claim ownership and get the following perks:</p>
      <ol>
        <li>Get notified when your posts are picked by daily.dev feed</li>
        <li>Exclusive author badge on your comments</li>
        <li>Analytics report for every post you wrote</li>
        <li>Gain reputation points by earning upvotes on posts you wrote</li>
      </ol>
      <div
        className="mt-6 grid max-w-[18.5rem] grid-flow-col gap-x-4"
        data-testid="authorOnboarding"
        style={{
          gridTemplateColumns: '1fr max-content',
        }}
      >
        {onSignUp && (
          <Button variant={ButtonVariant.Primary} onClick={onSignUp}>
            Sign up
          </Button>
        )}
        <Button
          variant={ButtonVariant.Secondary}
          tag="a"
          href={ownershipGuide}
          target="_blank"
          rel="noopener"
        >
          Learn more
        </Button>
      </div>
    </section>
  );
}

export default AuthorOnboarding;
