"use client";

export default function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-[#1B1B1B] hover:bg-[#2D2D2D] rounded-2xl shadow-lg p-6 transition-all border border-[#3A3A3A] cursor-pointer">
      <h3 className="text-xl font-semibold mb-2 text-[#FFCC00]">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
