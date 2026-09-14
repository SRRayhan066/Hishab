export function Divider({ label }: { label: string }) {
  return (
    <div className="text-ink-faint flex items-center gap-3 text-[14px]">
      <span className="bg-line-soft h-px flex-1" />
      {label}
      <span className="bg-line-soft h-px flex-1" />
    </div>
  );
}
