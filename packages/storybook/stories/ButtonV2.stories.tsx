import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import ShareIcon from '@dailydotdev/shared/src/components/icons/Share';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    href: {
      control: 'text',
    },
    onClick: {
      control: 'object',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Sizes: Story = {
  render: ({ children, ...props }) => (
    <div className="grid grid-cols-3 gap-4">
      <h2>Size</h2>
      <h2>Button</h2>
      <h2>IconOnly Button</h2>
      {Object.values(ButtonSize).map((size) => (
        <>
          <span key={size + '_header'}>{size}</span>
          <span key={size}>
            <Button {...props} size={size}>
              {children}
            </Button>
          </span>
          <span key={size + '_iconOnly'}>
            <Button {...props} size={size} icon={<ShareIcon />} Tag="span" />
          </span>
        </>
      ))}
    </div>
  ),
  name: 'Sizes',
  args: {
    children: 'Button',
    variant: ButtonVariant.Primary,
  },
};

export const Variants: Story = {
  render: ({ children, variant, ...props }) => (
    <div className="grid grid-cols-4 gap-4">
      <h2>Primary</h2>
      <h2>Secondary</h2>
      <h2>Tertiary</h2>
      <h2>Float</h2>
      {Object.values(ButtonVariant).map((variant) => (
        <span key={variant}>
          <Button {...props} variant={variant}>
            {children}
          </Button>
        </span>
      ))}
    </div>
  ),
  name: 'Variants',
  args: {
    children: 'Button',
  },
};

export const Icon: Story = {
  render: ({ children, icon, iconPosition, ...props }) => (
    <div className="grid grid-cols-3 gap-4">
      <h2>Icon left</h2>
      <h2>Icon right</h2>
      <h2>Icon only</h2>
      <span>
        <Button {...props} icon={icon}>
          {children}
        </Button>
      </span>
      <span>
        <Button {...props} icon={icon!} iconPosition={ButtonIconPosition.Right}>
          {children}
        </Button>
      </span>
      <span>
        <Button {...props} icon={icon} />
      </span>
    </div>
  ),
  name: 'Icon',
  args: {
    children: 'Share',
    icon: <ShareIcon />,
    variant: ButtonVariant.Primary,
  },
};
