export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-4 text-sm text-slate-500">
        © {new Date().getFullYear()} ContestAZM. All rights reserved.
      </div>
    </footer>
  );
}
