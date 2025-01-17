import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import classNames from 'classnames';
import { IconProps, IconSize } from '../Icon';
import { Loader } from '../Loader';
import { combinedClicks } from '../../lib/click';

export enum ButtonSize {
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
}

const buttonSizeToIconSize: Record<ButtonSize, IconSize> = {
  [ButtonSize.XSmall]: IconSize.XSmall,
  [ButtonSize.Small]: IconSize.Small,
  [ButtonSize.Medium]: IconSize.Medium,
  [ButtonSize.Large]: IconSize.Large,
  [ButtonSize.XLarge]: IconSize.XLarge,
};

export interface StyledButtonProps {
  buttonSize?: ButtonSize;
  iconOnly?: boolean;
}

export type IconType = React.ReactElement<IconProps>;

export interface BaseButtonProps {
  buttonSize?: ButtonSize;
  loading?: boolean;
  pressed?: boolean;
  tag?: React.ElementType;
  icon?: IconType;
  rightIcon?: IconType;
  children?: ReactNode;
  displayClass?: string;
  textPosition?: string;
  position?: string;
  disabled?: boolean;
  spanClassName?: string;
}

const useGetIconWithSize = (size: ButtonSize, iconOnly: boolean) => {
  return (icon: React.ReactElement<IconProps>) =>
    React.cloneElement(icon, {
      size: icon.props?.size ?? buttonSizeToIconSize[size],
      className: classNames(icon.props.className, !iconOnly && 'icon'),
    });
};

export type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;
export type AllowedElements = HTMLButtonElement | HTMLAnchorElement;
export type ButtonElementType<Tag extends AllowedTags> = Tag extends 'a'
  ? HTMLAnchorElement
  : HTMLButtonElement;

export type ButtonProps<Tag extends AllowedTags> = BaseButtonProps &
  HTMLAttributes<AllowedElements> &
  JSX.IntrinsicElements[Tag] & {
    ref?: Ref<ButtonElementType<Tag>>;
    readOnly?: boolean;
  };

function ButtonComponent<TagName extends AllowedTags>(
  {
    loading,
    pressed,
    icon,
    rightIcon,
    buttonSize = ButtonSize.Medium,
    children,
    tag: Tag = 'button',
    className,
    displayClass,
    position = 'relative',
    textPosition = 'justify-center',
    readOnly,
    iconOnly: showIconOnly,
    onClick,
    spanClassName,
    ...props
  }: StyledButtonProps & ButtonProps<TagName>,
  ref?: Ref<ButtonElementType<TagName>>,
): ReactElement {
  const iconOnly = (icon && !children && !rightIcon) || showIconOnly;
  const getIconWithSize = useGetIconWithSize(buttonSize, iconOnly);
  const isAnchor = Tag === 'a';

  return (
    <Tag
      {...(props as StyledButtonProps)}
      {...(isAnchor ? combinedClicks(onClick) : { onClick })}
      aria-busy={loading}
      aria-pressed={pressed}
      ref={ref}
      className={classNames(
        { iconOnly, readOnly },
        buttonSize,
        'btn shadow-none focus-outline cursor-pointer select-none flex-row items-center border font-bold no-underline typo-callout',
        textPosition,
        displayClass || 'flex',
        position,
        className,
      )}
    >
      {icon && getIconWithSize(icon)}
      {children && <span className={spanClassName}>{children}</span>}
      {rightIcon && getIconWithSize(rightIcon)}
      {loading && (
        <Loader
          data-testid="buttonLoader"
          className="btn-loader absolute bottom-0 left-0 right-0 top-0 m-auto hidden"
        />
      )}
    </Tag>
  );
}

export const Button = forwardRef(ButtonComponent);
