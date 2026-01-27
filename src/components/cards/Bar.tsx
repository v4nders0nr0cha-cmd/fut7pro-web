"use client";

export default function Bar({ title, value }: { title: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm text-white mb-1">
        <span>{title}</span>
        <span className="text-brand font-bold">{value} pts</span>
      </div>
      <div className="w-full bg-[#333] h-2 rounded">
        <div
          className="bg-brand h-2 rounded"
          style={{ width: `${value * 5}%`, maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}
