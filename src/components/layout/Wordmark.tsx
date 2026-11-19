export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-[28px] font-semibold leading-none tracking-tight text-ink ${className}`}>
      coy<span className="text-coral">.</span>
    </span>
  );
}
