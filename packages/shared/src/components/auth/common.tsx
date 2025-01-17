import React from 'react';
import cloneDeep from 'lodash.clonedeep';
// import TwitterIcon from '../icons/Twitter';
import FacebookIcon from '../icons/Facebook';
import GoogleIcon from '../icons/Google';
import GitHubIcon from '../icons/GitHub';
import AppleIcon from '../icons/Apple';
import classed from '../../lib/classed';
import { IconType } from '../buttons/ButtonV2';

export interface Provider {
  icon: IconType;
  label: string;
  value: string;
}

export enum SocialProvider {
  // Twitter = 'twitter',
  Facebook = 'facebook',
  Google = 'google',
  GitHub = 'github',
  Apple = 'apple',
}

type ProviderMap = Record<SocialProvider, Provider>;

export const providerMap: ProviderMap = {
  // twitter: {
  //   icon: <TwitterIcon />,
  //   provider: 'Twitter',
  //   style: { backgroundColor: '#1D9BF0' },
  // },
  facebook: {
    icon: <FacebookIcon className="socialIcon" secondary />,
    label: 'Facebook',
    value: 'facebook',
  },
  google: {
    icon: <GoogleIcon className="socialIcon" secondary />,
    label: 'Google',
    value: 'google',
  },
  github: {
    icon: <GitHubIcon className="socialIcon" secondary />,
    label: 'GitHub',
    value: 'github',
  },
  apple: {
    icon: <AppleIcon className="socialIcon" secondary />,
    label: 'Apple',
    value: 'apple',
  },
};

export const getProviderMapClone = (
  map: ProviderMap = providerMap,
): ProviderMap => cloneDeep(map);

export const providers: Provider[] = Object.values(providerMap);

export const AuthModalText = classed(
  'p',
  'typo-body text-theme-label-secondary',
);

export interface AuthFormProps {
  simplified?: boolean;
}

export const getFormEmail = (e: React.FormEvent): string => {
  const form = e.currentTarget as HTMLFormElement;
  const input = Array.from(form.elements).find(
    (el) => el.getAttribute('name') === 'email',
  ) as HTMLInputElement;

  return input?.value?.trim();
};
