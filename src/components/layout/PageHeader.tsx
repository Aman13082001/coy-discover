import { Wordmark } from "./Wordmark";

interface Props {
  title: string;
  subtitle?: string;
  /** "narrow" aligns the header with the centred discovery card on desktop. */
  width?: "narrow" | "wide";
}

/** Top bar for each tab. Shows the wordmark on mobile, where there is no side rail. */
export function PageHeader({ title, subtitle, width = "wide" }: Props) {
  const max = width === "narrow" ? "max-w-[420px] lg:px-4" : "max-w-5xl lg:px-10";
  return (
    <header className={`mx-auto flex w-full ${max} items-end justify-between gap-4 px-5 pb-3 pt-5 lg:pt-10`}>
      <div className="min-w-0">
        <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight lg:text-[38px]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-soft [@media(max-height:680px)]:hidden">{subtitle}</p>}
      </div>
      <Wordmark className="mb-1.5 shrink-0 text-[22px] lg:hidden" />
    </header>
  );
}
