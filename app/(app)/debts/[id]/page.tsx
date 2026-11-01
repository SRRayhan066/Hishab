import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PersonScreen } from "@/components/debts/PersonScreen";
import { getSessionUserId } from "@/lib/auth/session";
import { loadDebtBook } from "@/lib/finance/debt-store";
import { currentPeriod } from "@/lib/finance/period";
import { getT } from "@/lib/i18n/server";

async function findPerson(id: string) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const book = await loadDebtBook(userId);
  return book.people.find((person) => person.id === id);
}

export async function generateMetadata({
  params,
}: PageProps<"/debts/[id]">): Promise<Metadata> {
  const [{ id }, t] = await Promise.all([params, getT("meta")]);
  const person = await findPerson(id);
  return { title: person?.name ?? t("debtsTitle") };
}

export default async function PersonPage({ params }: PageProps<"/debts/[id]">) {
  const { id } = await params;
  const person = await findPerson(id);
  if (!person) notFound();

  return <PersonScreen person={person} current={currentPeriod()} />;
}
