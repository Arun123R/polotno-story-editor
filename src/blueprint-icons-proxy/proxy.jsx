import * as React from 'react';
import { IconSvgPaths16 as OrigPaths16, IconSvgPaths20 as OrigPaths20 } from '@blueprintjs/icons/lib/esm/allPaths.js';

// Re-export everything from the real Blueprint icons package
// eslint-disable-next-line react-refresh/only-export-components
export * from '@blueprintjs/icons/lib/esm/generated/index.js';

const DEFAULT_COLOR = '#0A0A0A';
const DEFAULT_SIZE = 16;

function getCompatIconClassName(iconName, className) {
  return [
    'bp5-icon',
    `bp5-icon-${iconName}`,
    'bp6-icon',
    `bp6-icon-${iconName}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

const CompatIcon = React.forwardRef(function CompatIcon(props, ref) {
  const {
    iconName,
    size = DEFAULT_SIZE,
    color = DEFAULT_COLOR,
    title,
    htmlTitle,
    className,
    svgProps,
    children,
    ...htmlProps
  } = props;

  const ariaHidden = title ? undefined : true;

  return (
    <span
      ref={ref}
      aria-hidden={ariaHidden}
      title={htmlTitle}
      className={getCompatIconClassName(iconName, className)}
      {...htmlProps}
    >
      <svg
        data-icon={iconName}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...(svgProps || {})}
      >
        {title ? <title>{title}</title> : null}
        {typeof children === 'function' ? children(color) : children}
      </svg>
    </span>
  );
});
CompatIcon.displayName = 'Custom.CompatIcon';

// Add (Plus) - exact user SVG (16x16)
export const Plus = React.forwardRef(function PlusIcon(props, ref) {
  return (
    <CompatIcon iconName="plus" ref={ref} {...props}>
      {(c) => (
        <>
          <path d="M3.33325 8H12.6666" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 3.33337V12.6667" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </CompatIcon>
  );
});
Plus.defaultProps = { size: DEFAULT_SIZE, color: DEFAULT_COLOR };

// Aliases for common add-related names to ensure override coverage
export const Add = Plus;
export const Insert = Plus;
export const SmallPlus = Plus;
export const NewObject = Plus;
export const AddRowBottom = Plus;

// Duplicate (16x16 provided SVG)
export const Duplicate = React.forwardRef(function DuplicateIcon(props, ref) {
  return (
    <CompatIcon iconName="duplicate" ref={ref} {...props}>
      {(c) => (
        <>
          <path d="M13.3333 5.33337H6.66659C5.93021 5.33337 5.33325 5.93033 5.33325 6.66671V13.3334C5.33325 14.0698 5.93021 14.6667 6.66659 14.6667H13.3333C14.0696 14.6667 14.6666 14.0698 14.6666 13.3334V6.66671C14.6666 5.93033 14.0696 5.33337 13.3333 5.33337Z" stroke={c} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.66659 10.6667C1.93325 10.6667 1.33325 10.0667 1.33325 9.33337V2.66671C1.33325 1.93337 1.93325 1.33337 2.66659 1.33337H9.33325C10.0666 1.33337 10.6666 1.93337 10.6666 2.66671" stroke={c} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </CompatIcon>
  );
});
Duplicate.defaultProps = { size: 16, color: DEFAULT_COLOR };

// Remove / Trash (16x16 provided SVG) - use BLACK by default so it shows on neutral backgrounds
export const Trash = React.forwardRef(function TrashIcon(props, ref) {
  return (
    <CompatIcon iconName="trash" ref={ref} {...props}>
      {(c) => (
        <>
          <path d="M2 4H14" stroke={c} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.6666 4V13.3333C12.6666 14 11.9999 14.6667 11.3333 14.6667H4.66659C3.99992 14.6667 3.33325 14 3.33325 13.3333V4" stroke={c} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.33325 4.00004V2.66671C5.33325 2.00004 5.99992 1.33337 6.66659 1.33337H9.33325C9.99992 1.33337 10.6666 2.00004 10.6666 2.66671V4.00004" stroke={c} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.66675 7.33337V11.3334" stroke={c} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.33325 7.33337V11.3334" stroke={c} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </CompatIcon>
  );
});
Trash.defaultProps = { size: 16, color: DEFAULT_COLOR };

// Custom cleaner path for Plus (filled shape matching user's stroked design)
// M7 4.333A1 1 0 0 1 9 4.333V7H11.667A1 1 0 0 1 11.667 9H9V11.667A1 1 0 0 1 7 11.667V9H4.333A1 1 0 0 1 4.333 7H7V4.333Z
const cleanPlusPath = ["M7 4.333A1 1 0 0 1 9 4.333V7H11.667A1 1 0 0 1 11.667 9H9V11.667A1 1 0 0 1 7 11.667V9H4.333A1 1 0 0 1 4.333 7H7V4.333Z"];

export const IconSvgPaths16 = {
  ...OrigPaths16,
  plus: cleanPlusPath,
  add: cleanPlusPath,
  insert: cleanPlusPath,
  "small-plus": cleanPlusPath,
  "new-object": cleanPlusPath,
  "add-row-bottom": cleanPlusPath,
};

export const IconSvgPaths20 = {
  ...OrigPaths20,
  plus: cleanPlusPath,
  add: cleanPlusPath,
  insert: cleanPlusPath,
  "small-plus": cleanPlusPath,
  "new-object": cleanPlusPath,
  "add-row-bottom": cleanPlusPath,
};

export default {};
