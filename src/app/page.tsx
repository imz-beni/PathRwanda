const steps = [
  { title: "Discover", text: "Explore careers, skills and typical pay in your sector." },
  { title: "Learn", text: "Find free and low-cost courses and track your progress." },
  { title: "Find opportunities", text: "Browse jobs, training and programs near you." },
  { title: "Get matched", text: "See opportunities that fit your interests and progress." },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">PathRwanda</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          From career interest to a clear path to work, starting with Agritech.
        </p>
      </header>
      <ol className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <span className="text-sm text-zinc-500">Step {i + 1}</span>
            <h2 className="text-lg font-medium">{step.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">{step.text}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
