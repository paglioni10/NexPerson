import Link from "next/link";

/** Primitivas de UI compartilhadas (sem dependências externas). */

export function Button({
  children,
  variant = "primary",
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles = {
    primary:
      "brand-fill shadow-[0_1px_3px_rgba(17,24,39,0.12)]",
    ghost: "border border-line text-ink hover:bg-subtle",
    danger: "text-danger hover:bg-danger-bg",
  }[variant];
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 ${styles}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? "brand-fill shadow-[0_1px_3px_rgba(17,24,39,0.12)]"
      : "border border-line text-ink hover:bg-subtle";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all ${styles}`}
    >
      {children}
    </Link>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

const fieldClass =
  "w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-light";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldClass} {...props} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return <textarea className={fieldClass} rows={2} {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={fieldClass} {...props} />;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Table({
  head,
  children,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="elev overflow-hidden rounded-card border border-line bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-subtle text-left text-xs font-semibold uppercase tracking-wide text-muted">
          {head}
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-card p-12 text-center text-sm text-faint">
      {children}
    </div>
  );
}
