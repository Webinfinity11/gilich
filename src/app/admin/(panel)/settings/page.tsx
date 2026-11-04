import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { requireAdmin } from "@/lib/admin";
import { loadSettingsInput } from "@/lib/settings";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await loadSettingsInput();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Site settings</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">Header, contact details, footer, About Us and other page texts.</p>
      <SettingsEditor initial={settings} />
    </div>
  );
}
