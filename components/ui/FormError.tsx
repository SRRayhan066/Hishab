export function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="bg-danger-bg border-danger-line text-danger-ink rounded-field border px-[15px] py-[13px] text-[15px]"
    >
      {message}
    </p>
  );
}
