import Link from "next/link";
import BrandMark from "./BrandMark";

export default function AuthFrame({
  title,
  subtitle,
  children,
  footerLabel,
  footerHref,
  footerCta,
}) {
  return (
    <main className="felt felt-night relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="felt-grain" />
      <div
        className="pointer-events-none absolute -left-16 top-16 hidden gap-2 opacity-40 sm:grid"
        aria-hidden="true"
        style={{ gridTemplateColumns: "repeat(3, 2.55rem)" }}
      >
        {["done", "empty", "missed", "empty", "done", "done", "missed", "empty", "done"].map(
          (state, index) => (
            <div key={index} className="well">
              {state === "empty" ? (
                <span className="well-void" />
              ) : (
                <span className={`disc disc-${state}`} />
              )}
            </div>
          ),
        )}
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <BrandMark size={56} />
          <div>
            <p className="font-display text-[11px] tracking-[0.34em] text-gold">LIG-4</p>
            <h1 className="font-display text-4xl uppercase leading-none tracking-wide">{title}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[rgba(8,20,40,0.86)] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {footerLabel}{" "}
          <Link className="font-semibold text-gold hover:underline" href={footerHref}>
            {footerCta}
          </Link>
        </p>
      </div>
    </main>
  );
}
