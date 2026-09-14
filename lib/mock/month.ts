import type { MonthData, VariableCategory } from "@/lib/finance/types";

const CATEGORY_SEEDS: [string, number][] = [
  ["বাজার-সদাই", 6000],
  ["বাইরে খাওয়া", 2500],
  ["যাওয়া-আসা", 2000],
  ["কেনাকাটা", 2000],
  ["ওষুধ ও ডাক্তার", 1000],
  ["অন্যান্য", 1500],
];

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function buildCategories(today: number): VariableCategory[] {
  const random = seededRandom(20260913);

  return CATEGORY_SEEDS.map(([name, budget], index) => {
    const perDay = budget / 30;
    const entries = [];

    for (let day = 1; day <= today; day += 1) {
      if (random() < 0.35) {
        entries.push({
          id: `e${index}_${day}`,
          day,
          amount: Math.max(
            20,
            Math.round((perDay * (1 + random() * 2.2)) / 10) * 10,
          ),
        });
      }
    }

    return { id: `v${index}`, name, budget, entries };
  });
}

export function getMockMonthData(now: Date = new Date()): MonthData {
  return {
    openingSavings: 45000,
    income: [{ id: "i1", name: "বেতন", amount: 58000 }],
    fixed: [
      { id: "f1", name: "পরিবারকে পাঠানো", amount: 20000 },
      { id: "f2", name: "বাসা ভাড়া", amount: 8000 },
      { id: "f3", name: "রান্নার আপা", amount: 2000 },
      { id: "f4", name: "ইন্টারনেট ও বিল", amount: 1500 },
      { id: "f5", name: "মোবাইল", amount: 500 },
    ],
    variable: buildCategories(now.getDate()),
    history: [
      { month: "এপ্রিল", spent: 13400, budget: 15000 },
      { month: "মে", spent: 15900, budget: 15000 },
      { month: "জুন", spent: 12800, budget: 15000 },
      { month: "জুলাই", spent: 14200, budget: 15000 },
      { month: "আগস্ট", spent: 16800, budget: 15000 },
    ],
  };
}
