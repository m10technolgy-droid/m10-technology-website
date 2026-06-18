const STATUS_STYLES: Record<string, string> = {
  pending: "bg-zinc-100 text-zinc-700",
  not_started: "bg-zinc-100 text-zinc-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  ready_for_pickup: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-700";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${style}`}>
      {formatStatus(status)}
    </span>
  );
}
