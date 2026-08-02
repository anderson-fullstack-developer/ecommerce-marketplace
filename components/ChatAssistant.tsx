"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  role: "user" | "bot";
  text: string;
};

const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["envio", "entrega", "prazo", "demora", "chega"],
    answer: "Enviamos para todo Portugal em 3 a 5 dias úteis.",
  },
  {
    keywords: ["pagamento", "pagar", "cartao", "cartão", "mbway", "mb way", "multibanco"],
    answer:
      "Podes pagar com cartão, MB WAY, Multibanco ou Klarna, de forma segura na página de checkout.",
  },
  {
    keywords: ["produto", "vende", "vendem", "tem", "cataloga", "catálogo"],
    answer:
      "Vendemos produtos genuínos de São Tomé e Príncipe — café, cacau, artesanato, tecidos e mais. Vê tudo em /loja.",
  },
  {
    keywords: ["comprar", "encomenda", "encomendar", "carrinho", "checkout"],
    answer:
      "É simples: escolhe os produtos, adiciona ao carrinho e finaliza a compra no checkout — o pagamento é seguro.",
  },
  {
    keywords: ["vender", "fornecedor", "vendedor", "candidatura"],
    answer:
      "Se quiseres vender os teus produtos aqui, candidata-te em /torna-te-vendedor — a nossa equipa analisa e aprova.",
  },
  {
    keywords: ["contacto", "contactar", "email", "duvida", "dúvida", "ajuda", "suporte"],
    answer: "Podes contactar-nos em stpnetosabores@gmail.com ou pelo formulário em /contacto.",
  },
];

const QUICK_REPLIES: { label: string; question: string; href?: string }[] = [
  { label: "Envio", question: "Qual o prazo de entrega?" },
  { label: "Pagamento", question: "Como posso pagar?" },
  { label: "Como comprar", question: "Como faço uma encomenda?" },
  { label: "Vender aqui", question: "Como me torno vendedor?" },
  { label: "Contacto", question: "Como posso contactar-vos?", href: "/contacto" },
];

const FALLBACK_ANSWER =
  "Ainda não sei responder a isso — este assistente está em desenvolvimento pelo programador. Por agora, contacta-nos em stpnetosabores@gmail.com ou pelo formulário em /contacto.";

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function findAnswer(question: string) {
  const normalized = normalizeText(question);

  const match = FAQ.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );

  return match?.answer ?? FALLBACK_ANSWER;
}

export function ChatAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Olá! Sou o assistente da Neto STP. Posso ajudar com dúvidas sobre envio, pagamento, produtos ou como vender aqui.",
    },
  ]);

  function sendQuestion(question: string) {
    if (!question.trim()) return;
    const answer = findAnswer(question);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "bot", text: answer },
    ]);
  }

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    sendQuestion(input.trim());
    setInput("");
  }

  function handleQuickReply(quickReply: (typeof QUICK_REPLIES)[number]) {
    if (quickReply.href) {
      setOpen(false);
      router.push(quickReply.href);
      return;
    }
    sendQuestion(quickReply.question);
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex justify-end sm:inset-x-auto sm:right-4">
      {open ? (
        <div className="flex h-[min(28rem,calc(100dvh-6rem))] w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3">
            <p className="text-sm font-medium text-primary-foreground">Assistente Neto STP</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground"
              aria-label="Fechar chat"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="flex gap-1.5 overflow-x-auto border-t p-2">
            {QUICK_REPLIES.map((quickReply) => (
              <button
                key={quickReply.label}
                type="button"
                onClick={() => handleQuickReply(quickReply)}
                className="shrink-0 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs whitespace-nowrap text-primary hover:bg-primary/10"
              >
                {quickReply.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escreve a tua pergunta..."
              className="h-9"
            />
            <Button type="submit" size="sm" className="shrink-0 px-2.5">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      ) : (
        <Button
          size="lg"
          className="size-14 shrink-0 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Abrir chat de apoio"
        >
          <MessageCircle className="size-6" />
        </Button>
      )}
    </div>
  );
}
