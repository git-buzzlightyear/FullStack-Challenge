import { Button } from './Button';

interface Props {
  page: number;
  totalPages: number;
  onPageChange(p: number): void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  const prev = () => onPageChange(page - 1);
  const next = () => onPageChange(page + 1);

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <Button disabled={page <= 1} onClick={prev}>
        « Prev
      </Button>
      <span className="text-sm font-medium">
        Page {page} / {totalPages}
      </span>
      <Button disabled={page >= totalPages} onClick={next}>
        Next »
      </Button>
    </div>
  );
}
