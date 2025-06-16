"use client";

import { User } from "@/types/interfaces";

type ListDetailProps = {
  item: User;
};

export default function ListDetail({ item: user }: ListDetailProps) {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl text-white shadow-md">
      <h1 className="text-xl font-bold text-yellow-400 mb-4">Detalhes do Usuário</h1>
      <p className="mb-2">
        <span className="font-semibold text-white">Nome:</span> {user.name}
      </p>
      <p>
        <span className="font-semibold text-white">ID:</span> {user.id}
      </p>
    </div>
  );
}
