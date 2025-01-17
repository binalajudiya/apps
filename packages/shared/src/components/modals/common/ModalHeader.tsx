import React, { ReactElement, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { ModalTabs, ModalTabsProps } from './ModalTabs';
import { ModalClose } from './ModalClose';
import { ModalHeaderKind, ModalPropsContext } from './types';
import { Button, ButtonProps, ButtonVariant } from '../../buttons/ButtonV2';
import ArrowIcon from '../../icons/Arrow';
import { ModalStepsWrapper } from './ModalStepsWrapper';
import { ProgressBar } from '../../fields/ProgressBar';

export type ModalHeaderProps = {
  kind?: ModalHeaderKind;
  children?: ReactNode;
  className?: string;
  title?: string;
  showCloseButton?: boolean;
};

const headerKindToTitleClassName: Record<ModalHeaderKind, string> = {
  [ModalHeaderKind.Primary]: 'typo-title3',
  [ModalHeaderKind.Secondary]: 'typo-body',
  [ModalHeaderKind.Tertiary]: 'typo-callout text-theme-label-tertiary',
  [ModalHeaderKind.Quaternary]: 'typo-callout text-theme-label-tertiary',
};
const ModalHeaderTitle = classed('h3', 'font-bold');
const ModalHeaderOuter = classed(
  'header',
  'flex items-center py-4 px-6 w-full h-14',
);
const ModalHeaderSubtitle = classed('h3', 'font-bold typo-callout');

export function ModalHeader({
  kind = ModalHeaderKind.Primary,
  children,
  className,
  title,
  showCloseButton = true,
}: ModalHeaderProps): ReactElement {
  const { activeView, onRequestClose, tabs } = useContext(ModalPropsContext);
  const modalTitle = title ?? (tabs ? activeView : undefined);
  return (
    <ModalHeaderOuter
      className={classNames(
        'relative',
        (modalTitle || children) && 'border-b border-theme-divider-tertiary',
        className,
      )}
    >
      {children}
      {!!modalTitle && (
        <ModalHeaderTitle className={headerKindToTitleClassName[kind]}>
          {modalTitle}
        </ModalHeaderTitle>
      )}
      {showCloseButton && onRequestClose && (
        <ModalClose onClick={onRequestClose} />
      )}
    </ModalHeaderOuter>
  );
}

export function ModalHeaderTabs(props: ModalTabsProps): ReactElement {
  const { onRequestClose } = useContext(ModalPropsContext);
  return (
    <ModalHeaderOuter className="border-b border-theme-divider-tertiary">
      <ModalTabs {...props} />
      {onRequestClose && <ModalClose onClick={onRequestClose} />}
    </ModalHeaderOuter>
  );
}

const ModalHeaderStepsButton = (props: ButtonProps<'button'>) => (
  <Button
    icon={<ArrowIcon className="-rotate-90" />}
    className="-ml-2 mr-2"
    variant={ButtonVariant.Tertiary}
    {...props}
  />
);

export function ModalHeaderSteps(props: ModalHeaderProps): ReactElement {
  const { activeView, steps } = useContext(ModalPropsContext);
  const activeStepIndex = steps.findIndex(({ key }) => activeView === key);
  const activeStep = steps[activeStepIndex];
  if (!activeStep) {
    return null;
  }
  const stepperWidth = () => ((activeStepIndex + 1) / steps.length) * 100;
  const progress = activeStep.hideProgress ? null : (
    <ProgressBar percentage={stepperWidth()} className="top-[3.3rem]" />
  );
  if (activeStep.title) {
    return (
      <ModalHeader {...props}>
        {activeStep.title}
        {progress}
      </ModalHeader>
    );
  }
  return (
    <ModalHeader {...props}>
      <ModalStepsWrapper>
        {({ previousStep }) =>
          previousStep && <ModalHeaderStepsButton onClick={previousStep} />
        }
      </ModalStepsWrapper>
      <ModalHeaderSubtitle>{activeView}</ModalHeaderSubtitle>
      {progress}
    </ModalHeader>
  );
}

ModalHeader.Title = ModalHeaderTitle;
ModalHeader.Subtitle = ModalHeaderSubtitle;
ModalHeader.Tabs = ModalHeaderTabs;
ModalHeader.Steps = ModalHeaderSteps;
ModalHeader.StepsButton = ModalHeaderStepsButton;
