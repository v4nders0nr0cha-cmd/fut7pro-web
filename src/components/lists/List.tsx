// src/components/lists/List.tsx
"use client";

import ListItem from "./ListItem";
import type { User } from "@/types/interfaces";

type Props = {
  items: User[];
};

export default function List({ items }: Props) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <ListItem data={item} />
        </li>
      ))}
    </ul>
  );
}
