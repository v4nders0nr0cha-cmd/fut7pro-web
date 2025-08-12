// src/components/superadmin/CardResumo.tsx

export function CardResumo({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  color?: string;
  icon?: string;
}) {
  return (
    <div
      className={`rounded-xl shadow-lg p-6 flex flex-col items-center justify-center bg-gray-900`}
    >
      <div className={`text-4xl mb-2 ${color ?? "text-yellow-500"}`}>{icon}</div>
      <div className="text-2xl font-extrabold text-yellow-400">{value}</div>
      <div className="text-md text-gray-200 mt-1 text-center">{title}</div>
    </div>
  );
}
