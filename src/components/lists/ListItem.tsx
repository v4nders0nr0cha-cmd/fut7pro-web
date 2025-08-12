// src/components/lists/ListItem.tsx
"use client";

import Link from "next/link";
import type { User } from "@/types/interfaces";

type Props = {
  data: User;
};

export default function ListItem({ data }: Props) {
  return (
    <Link
      href={`/users/${data.id}`}
      className="block p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg mb-2 transition-all shadow-md"
    >
      <p className="font-semibold text-yellow-400">{data.name}</p>
      <span className="text-sm text-gray-400">ID: {data.id}</span>
    </Link>
  );
}
