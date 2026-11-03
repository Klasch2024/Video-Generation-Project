import { AppShell } from "@/components/AppShell";
import { AddVideoForm } from "@/components/AddVideoForm";

export default function NewVideoPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <AddVideoForm />
      </div>
    </AppShell>
  );
}
