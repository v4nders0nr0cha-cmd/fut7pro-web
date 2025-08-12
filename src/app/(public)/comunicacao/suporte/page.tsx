// src/app/comunicacao/suporte/page.tsx
export const metadata = {
  title: "Chat | Fut7Pro",
  description: "Converse com a administração do seu racha. Tire dúvidas e acompanhe respostas.",
  keywords: "fut7, chat, suporte, racha, SaaS",
};

import ChatClient from "./ChatClient";

export default function SuportePage() {
  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-100 mb-4">Chat com o Admin</h1>
      <ChatClient />
    </div>
  );
}
