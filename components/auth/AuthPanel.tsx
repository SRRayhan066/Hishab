import { Logo } from "@/components/icons/Logo";

const points = [
  "প্রতিদিনের খরচ এক জায়গায়",
  "বেঁচে যাওয়া টাকা পরের মাসে যোগ",
  "শুধু তোমার জন্য, কোনো ঝামেলা নেই",
];

export function AuthPanel() {
  return (
    <aside className="bg-panel hidden flex-col justify-between gap-9 px-9 py-10 md:flex md:min-h-[420px]">
      <Logo />

      <div>
        <p className="font-display text-[clamp(26px,4.4vw,34px)] leading-[1.3] font-bold tracking-[-0.01em]">
          মাসের শুরুতে হিসাব,
          <br />
          মাস শেষে স্বস্তি।
        </p>
        <p className="text-ink-panel mt-[14px] max-w-[30ch] text-[16px] leading-[1.6]">
          বেতন কোথায় কত যাবে ঠিক করে নাও। খরচ যোগ করতে থাকো, বাকিটা হিসাব নিজেই
          রাখবে।
        </p>
      </div>

      <ul className="flex flex-col gap-[11px]">
        {points.map((point) => (
          <li
            key={point}
            className="text-ink-panel flex items-center gap-[11px] text-[15px]"
          >
            <span className="bg-primary h-[7px] w-[7px] flex-none rounded-full" />
            {point}
          </li>
        ))}
      </ul>
    </aside>
  );
}
