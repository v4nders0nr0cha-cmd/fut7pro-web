"use client";

export default function Bar({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-white">
        <span>{title}</span>
        <span className="font-bold text-yellow-400">{value} pts</span>
      </div>
      <div className="h-2 w-full rounded bg-[#333]">
        <div
          className="h-2 rounded bg-yellow-400"
          style={{ width: `${value * 5}%`, maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}
