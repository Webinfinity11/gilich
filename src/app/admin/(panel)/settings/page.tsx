import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { requireAdmin } from "@/lib/admin";
import { loadSettingsInput } from "@/lib/settings";

export const metadata = { title: "საიტის პარამეტრები" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await loadSettingsInput();
  return (
    <div>
      <h1 className="text-2xl font-semibold">საიტის პარამეტრები</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">ჰედერი, კონტაქტი, ფუტერი, „ჩვენ შესახებ“ და სხვა გვერდების ტექსტები.</p>
      <SettingsEditor initial={settings} />
    </div>
  );
}
