import React from 'react';
import clsx from 'clsx';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function Button({ className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'rounded-md bg-blue-600 px-4 py-0 text-white shadow-sm cursor-pointer ' +
          'hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    />
  );
}
