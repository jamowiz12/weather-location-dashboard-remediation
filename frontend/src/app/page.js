import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 px-5 py-6 text-white sm:px-8">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-slate-800 pb-5">
        <Link href="/" className="text-sm font-semibold tracking-wide text-white">
          Weather <span className="text-cyan-300">/</span> Location
        </Link>
        <nav aria-label="Account" className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-lg px-3 py-2 text-slate-300 hover:text-white">Log in</Link>
          <Link href="/register" className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300">Create account</Link>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase text-cyan-300">Weather and Location Dashboard</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">Your day, in context.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">Check conditions alongside the places that matter. Sign in to open your location dashboard.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Get started</Link>
            <Link href="/login" className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 hover:border-slate-500">Sign in</Link>
          </div>
        </div>

        <div className="border-y border-slate-800 py-6 md:border-y-0 md:border-l md:py-3 md:pl-9">
          <p className="text-xs font-semibold uppercase text-slate-400">Workspace</p>
          <h2 className="mt-2 text-xl font-semibold">A clear view of a place</h2>
          <dl className="mt-6 divide-y divide-slate-800 border-y border-slate-800">
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-slate-400">Weather</dt><dd className="text-right text-sm font-medium text-slate-200">Live provider data</dd></div>
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-slate-400">Map</dt><dd className="text-right text-sm font-medium text-slate-200">Location search</dd></div>
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-slate-400">Account</dt><dd className="text-right text-sm font-medium text-slate-200">Protected access</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-slate-500">Weather and map availability depends on the configured provider keys.</p>
        </div>
      </section>
    </main>
  );
}
