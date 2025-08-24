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
      className={`flex flex-col items-center justify-center rounded-xl bg-gray-900 p-6 shadow-lg`}
    >
      <div className={`mb-2 text-4xl ${color ?? "text-yellow-500"}`}>
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-yellow-400">{value}</div>
      <div className="text-md mt-1 text-center text-gray-200">{title}</div>
    </div>
  );
}
