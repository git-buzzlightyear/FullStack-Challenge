import clsx from 'clsx';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  name?: string;
  label: string;
  className?: string;
}

export function Input({ label, className, ...props }: Props) {
  const id = props.id ?? props.name ?? label.replace(/\s+/g, '-').toLowerCase();
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <input
        id={id}
        {...props}
        className={clsx(
          'w-full rounded-md border border-gray-300 bg-white py-2.5 px-2 mt-1 ' +
            'shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ' +
            'dark:bg-gray-800 dark:text-gray-100',
          className,
        )}
      />
    </label>
  );
}
