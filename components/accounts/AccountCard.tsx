"use client";

import {
  Banknote,
  Coins,
  Gem,
  Landmark,
  Nfc,
  PiggyBank,
  Smartphone,
  Vault,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import type { UseFormRegister } from "react-hook-form";
import { AmountInput } from "@/components/ui/AmountInput";
import { colorOf, type AccountIcon } from "@/lib/finance/account-style";
import { useFormat, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import type { AccountFormValues } from "./AccountListCard";

const icons: Record<AccountIcon, LucideIcon> = {
  landmark: Landmark,
  wallet: Wallet,
  smartphone: Smartphone,
  piggy: PiggyBank,
  coins: Coins,
  banknote: Banknote,
  vault: Vault,
  gem: Gem,
};

const fieldClass =
  "rounded-[10px] border-[1.5px] border-dashed border-black/15 bg-white/35 outline-none transition-colors hover:border-black/25 focus-within:border-solid focus-within:border-primary focus-within:bg-white/85";

type AccountCardProps = {
  index: number;
  color: string;
  icon: string;
  balance: number;
  removable: boolean;
  busy: boolean;
  register: UseFormRegister<AccountFormValues>;
  nameRef: (node: HTMLInputElement | null) => void;
  onRemove: () => void;
  onEdit: () => void;
};

export function AccountCard({
  index,
  color,
  icon,
  balance,
  removable,
  busy,
  register,
  nameRef,
  onRemove,
  onEdit,
}: AccountCardProps) {
  const t = useT("accounts");
  const format = useFormat();
  const number = format.digits(index + 1);
  const palette = colorOf(color);
  const Watermark = icons[icon as AccountIcon] ?? Wallet;
  const nameField = register(`accounts.${index}.name`, { onChange: onEdit });

  return (
    <li
      className="relative isolate flex min-h-[172px] flex-col overflow-hidden rounded-[20px] border px-4 pt-3.5 pb-3.5 shadow-[0_1px_2px_rgba(42,40,37,0.04),0_10px_24px_-14px_rgba(42,40,37,0.28)]"
      style={{
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
        borderColor: palette.border,
        color: palette.ink,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-12 -z-10 h-48 w-48 rounded-full bg-white/55 blur-2xl"
      />
      <Watermark
        aria-hidden
        strokeWidth={1.4}
        className="pointer-events-none absolute top-3 -right-5 -z-10 h-[112px] w-[112px] -rotate-12 opacity-[0.11]"
      />

      <div className="flex h-7 items-center justify-between gap-2">
        <div aria-hidden className="flex items-center gap-1.5">
          <span className="relative h-[26px] w-[36px] overflow-hidden rounded-[6px] border border-[#c8b27c] bg-[linear-gradient(135deg,#f4e6b8,#d8c088)]">
            <span className="absolute inset-y-0 left-1/3 w-px bg-[#b3995c]/60" />
            <span className="absolute inset-y-0 right-1/3 w-px bg-[#b3995c]/60" />
            <span className="absolute inset-x-0 top-1/2 h-px bg-[#b3995c]/60" />
          </span>
          <Nfc className="h-[18px] w-[18px] opacity-45" strokeWidth={1.8} />
        </div>

        {removable && (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            aria-label={t("removeAccount", { index: number })}
            className="hover:text-danger focus-visible:outline-primary -mr-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/40 opacity-70 transition hover:bg-white/80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
          </button>
        )}
      </div>

      <div className="mt-1.5">
        <p className="text-[13px] font-medium opacity-75">{t("balanceNow")}</p>
        <p
          className={cn(
            "font-display text-[24px] leading-tight font-bold tracking-[-0.01em]",
            balance < 0 && "text-danger",
          )}
        >
          {format.taka(balance)}
        </p>
      </div>

      <div className="mt-auto flex items-end gap-2 pt-2.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[11px] font-medium tracking-[0.04em] opacity-65">
            {t("accountName")}
          </span>
          <input
            {...nameField}
            ref={(node) => {
              nameField.ref(node);
              nameRef(node);
            }}
            placeholder={t("accountPlaceholder")}
            aria-label={t("nameAria", { index: number })}
            className={cn(
              fieldClass,
              "font-display h-9 w-full min-w-0 px-2.5 text-[16px] font-semibold tracking-[0.02em] placeholder:font-normal placeholder:opacity-45",
            )}
          />
        </div>

        <label className="flex w-[112px] flex-none flex-col gap-1">
          <span className="text-[11px] font-medium tracking-[0.04em] opacity-65">
            {t("balance")}
          </span>
          <span className={cn(fieldClass, "flex h-9 items-center gap-1 px-2.5")}>
            <span className="text-[14px] font-semibold opacity-60">৳</span>
            <AmountInput
              {...register(`accounts.${index}.amount`, { onChange: onEdit })}
              placeholder="0"
              aria-label={t("balanceAria", { index: number })}
              className="w-full min-w-0 border-none bg-transparent text-right text-[15px] font-bold outline-none placeholder:opacity-45"
            />
          </span>
        </label>
      </div>
    </li>
  );
}
