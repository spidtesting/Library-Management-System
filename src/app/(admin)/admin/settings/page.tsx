import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { getSettings } from "@/services/settingsService";
import { SettingsForm } from "@/components/features/settings/SettingsForm";

export const metadata: Metadata = { title: "Settings | Admin" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHeader title="Settings" description="Library configuration" />
      <SettingsForm settings={settings} />
    </div>
  );
}
