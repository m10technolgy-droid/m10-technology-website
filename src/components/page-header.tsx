export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="py-12 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">{title}</h1>
        {subtitle && <p className="mt-3 text-zinc-600 max-w-xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
