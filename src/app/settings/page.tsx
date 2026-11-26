import { getViewer } from "@/lib/learner";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings" };

export default async function Settings() {
  const v = await getViewer();
  if (!v) redirect("/login");
  return (
    <div className="wrap narrow stack-lg">
      <div className="stack">
        <h1>Settings</h1>
        <p className="muted">Make the site look, read and behave the way that works for you. Changes show straight away and are saved to your account, so they follow you to any device.</p>
      </div>
      <SettingsForm />
    </div>
  );
}
