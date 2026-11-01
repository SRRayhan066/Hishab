import { getEntryContext } from "@/lib/finance/view";
import { EntrySheet } from "./EntrySheet";

export async function EntrySheetLoader() {
  const context = await getEntryContext();
  return <EntrySheet context={context} />;
}
