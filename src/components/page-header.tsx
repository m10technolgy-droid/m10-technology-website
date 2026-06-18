export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-[#0B1F4A] text-white py-12 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
        {subtitle && <p className="mt-3 text-zinc-300 max-w-xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
