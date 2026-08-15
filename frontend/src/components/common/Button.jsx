const VARIANTS = {
  primary: "bg-brand-500 text-white hover:bg-brand-600",
  outline: "border border-slate-300 text-slate-700 hover:bg-slate-100",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
