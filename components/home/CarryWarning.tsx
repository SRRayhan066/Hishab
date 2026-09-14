import { formatTaka } from "@/lib/finance/format";

type CarryWarningProps = {
  overCarry: number;
  adjustedBudget: number;
};

export function CarryWarning({ overCarry, adjustedBudget }: CarryWarningProps) {
  if (overCarry <= 0) return null;

  return (
    <div className="bg-danger-bg border-danger-line flex items-start gap-[14px] rounded-[18px] border px-5 py-[18px]">
      <span className="bg-danger mt-2 h-[10px] w-[10px] flex-none rounded-full" />
      <div>
        <p className="text-[16px] font-bold">
          গত মাসে বাজেটের বাইরে {formatTaka(overCarry)} খরচ হয়ে গেছে
        </p>
        <p className="text-ink-soft mt-1 text-[15px] leading-[1.55]">
          এই মাসে সেটা পুষিয়ে নিতে হলে অন্তত {formatTaka(overCarry)} কম খরচ করতে
          হবে। তাই এই মাসের খরচের সীমা {formatTaka(adjustedBudget)} ধরা হয়েছে।
        </p>
      </div>
    </div>
  );
}
