import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-6xl font-black font-mono text-accent">404</h1>
        <h2 className="text-2xl font-bold">Страница не найдена / Page Not Found</h2>
        <p className="text-sm text-slate-400">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-accent font-mono text-xs uppercase tracking-widest font-bold"
          >
            На главную / Home
          </Link>
        </div>
      </div>
    </div>
  );
}
