import React, {
  ChangeEvent,
  forwardRef,
  LegacyRef,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
  InputHTMLAttributes,
} from 'react';
import classNames from 'classnames';
import VIcon from '../icons/V';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  checked?: boolean;
  id?: string;
  children?: ReactNode;
  className?: string;
  onToggle?: (checked: boolean) => unknown;
}

export const Checkbox = forwardRef(function Checkbox(
  {
    name,
    checked,
    children,
    className,
    onToggle,
    id,
    disabled,
    ...props
  }: CheckboxProps,
  ref: LegacyRef<HTMLInputElement>,
): ReactElement {
  const [actualChecked, setActualChecked] = useState(checked);

  useEffect(() => {
    setActualChecked(checked);
  }, [checked]);

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setActualChecked(event.target.checked);
    onToggle?.(event.target.checked);
  };

  return (
    <label
      className={classNames(
        'relative z-1 inline-flex cursor-pointer select-none items-center p-1 pr-3 text-theme-label-tertiary typo-footnote',
        styles.label,
        className,
        { checked: actualChecked, disabled },
      )}
      style={{ transition: 'color 0.1s linear' }}
      htmlFor={id}
    >
      <input
        {...props}
        disabled={disabled}
        id={id}
        type="checkbox"
        className="absolute h-0 w-0 opacity-0"
        name={name}
        checked={checked}
        onChange={onChange}
        ref={ref}
      />
      <div
        className={classNames(
          'relative z-1 mr-3 flex h-5 w-5 items-center justify-center rounded-md border-2 border-theme-divider-primary',
          styles.checkmark,
        )}
      >
        <VIcon
          className="icon h-full w-full text-theme-label-primary opacity-0"
          style={{ transition: 'opacity 0.1s linear' }}
        />
      </div>
      {children}
    </label>
  );
});
