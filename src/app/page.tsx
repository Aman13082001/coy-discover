import { PageHeader } from "@/components/layout/PageHeader";

/** Placeholder for Coy's existing experience. Intentionally blank, as the assignment asks. */
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Home" />
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-sm text-ink-faint">Coy&apos;s existing experience lives here.</p>
      </div>
    </main>
  );
}
