// src/app/comunicacao/suporte/page.tsx
export const metadata = {
  title: "Chat | Fut7Pro",
  description:
    "Converse com a administração do seu racha. Tire dúvidas e acompanhe respostas.",
  keywords: "fut7, chat, suporte, racha, SaaS",
};

import ChatClient from "./ChatClient";

export default function SuportePage() {
  return (
    <div className="mx-auto max-w-2xl pb-24 pt-20 md:pb-8 md:pt-6">
      <h1 className="mb-4 text-xl font-bold text-zinc-100">Chat com o Admin</h1>
      <ChatClient />
    </div>
  );
}
