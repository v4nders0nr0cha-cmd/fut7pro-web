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
      className="mb-2 block rounded-lg bg-[#1a1a1a] p-3 text-white shadow-md transition-all hover:bg-[#2a2a2a]"
    >
      <p className="font-semibold text-yellow-400">{data.name}</p>
      <span className="text-sm text-gray-400">ID: {data.id}</span>
    </Link>
  );
}
