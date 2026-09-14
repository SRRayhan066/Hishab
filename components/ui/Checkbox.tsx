import type { ComponentPropsWithRef } from "react";
import { Check } from "lucide-react";

type CheckboxProps = Omit<ComponentPropsWithRef<"input">, "type"> & {
  label: string;
};

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-[9px] py-[6px]">
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="border-line-strong bg-field peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:outline-primary [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100 flex h-[21px] w-[21px] flex-none items-center justify-center rounded-[7px] border-[1.5px] text-white transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
        <Check className="h-[13px] w-[13px] transition-opacity" strokeWidth={3} />
      </span>
      <span className="text-ink-soft text-[15px] select-none">{label}</span>
    </label>
  );
}
