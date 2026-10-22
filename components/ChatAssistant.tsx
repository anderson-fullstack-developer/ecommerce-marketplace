"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/shipping";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "bot";
  text: string;
};

function formatEuro(value: number) {
  return `€${value.toFixed(2).replace(".", ",")}`;
}

// A ordem importa: ganha a primeira entrada com uma palavra-chave na pergunta.
// "vendedor" vem antes de "produto" porque "vendedor" contém "vende".
const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["vender", "vendedor", "fornecedor", "candidatura"],
    answer:
      "Se quiseres vender os teus produtos aqui, candidata-te em /torna-te-vendedor — a nossa equipa analisa e aprova.",
  },
  {
    keywords: ["estado", "acompanhar", "seguir", "minha encomenda", "minhas encomendas", "onde esta"],
    answer:
      "Podes acompanhar as tuas encomendas em /conta, na secção \"As minhas encomendas\" — vês o estado de cada uma.",
  },
  {
    keywords: ["portes", "custo de envio", "preco do envio", "gratis", "grátis"],
    answer: `O envio é grátis a partir de ${formatEuro(FREE_SHIPPING_THRESHOLD)}. Abaixo disso custa ${formatEuro(SHIPPING_FEE)}.`,
  },
  {
    keywords: ["envio", "entrega", "prazo", "demora", "chega"],
    answer: `Enviamos para todo Portugal em 3 a 5 dias úteis. O envio é grátis a partir de ${formatEuro(FREE_SHIPPING_THRESHOLD)}.`,
  },
  {
    keywords: ["pagamento", "pagar", "cartao", "cartão", "mbway", "mb way", "multibanco"],
    answer:
      "Podes pagar com cartão, MB WAY, Multibanco ou Klarna, de forma segura na página de checkout.",
  },
  {
    keywords: ["comprar", "encomendar", "encomenda", "carrinho", "checkout"],
    answer:
      "É simples: escolhe os produtos em /loja, adiciona ao carrinho e finaliza a compra no checkout — o pagamento é seguro.",
  },
  {
    keywords: ["criar conta", "minha conta", "registar", "login", "iniciar sessao", "password"],
    answer:
      "Podes entrar ou criar conta em /conta/login — também dá para entrar com Google.",
  },
  {
    keywords: ["produto", "vendem", "catalogo", "catálogo", "cafe", "café", "cacau"],
    answer:
      "Vendemos produtos genuínos de São Tomé e Príncipe — café, cacau, artesanato, tecidos e mais. Vê tudo em /loja.",
  },
  {
    keywords: ["contacto", "contactar", "email", "duvida", "dúvida", "ajuda", "suporte"],
    answer: "Podes contactar-nos em stpnetosabores@gmail.com ou pelo formulário em /contacto.",
  },
];

const QUICK_REPLIES: { label: string; question: string }[] = [
  { label: "Prazo de entrega", question: "Qual o prazo de entrega?" },
  { label: "Pagamento", question: "Como posso pagar?" },
  { label: "A minha encomenda", question: "Onde vejo o estado da minha encomenda?" },
  { label: "Como comprar", question: "Como faço uma encomenda?" },
  { label: "Vender aqui", question: "Como me torno vendedor?" },
  { label: "Contacto", question: "Como posso contactar-vos?" },
];

const WELCOME_MESSAGE: Message = {
  role: "bot",
  text: "Olá! 👋 Sou o assistente da Neto STP. Escolhe um tema abaixo ou escreve a tua pergunta.",
};

const FALLBACK_ANSWER =
  "Ainda não sei responder a isso. Contacta-nos em stpnetosabores@gmail.com ou pelo formulário em /contacto e respondemos o mais rápido possível.";

const TYPING_DELAY_MS = 600;

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

// Torna clicáveis os caminhos da loja (/loja, /contacto...) e os emails das respostas.
const LINK_PATTERN = /(\/[a-z][a-z-]*(?:\/[a-z][a-z-]*)*|[\w.+-]+@[\w-]+\.[\w.]+)/g;

function MessageText({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const parts = text.split(LINK_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>;

        const className = "font-medium underline underline-offset-2";
        if (part.includes("@")) {
          return (
            <a key={index} href={`mailto:${part}`} className={className}>
              {part}
            </a>
          );
        }
        return (
          <Link key={index} href={part} onClick={onNavigate} className={className}>
            {part}
          </Link>
        );
      })}
    </>
  );
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function sendQuestion(question: string) {
    if (!question || isTyping) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: findAnswer(question) }]);
      setIsTyping(false);
    }, TYPING_DELAY_MS);
  }

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    sendQuestion(input.trim());
    setInput("");
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex justify-end sm:inset-x-auto sm:right-5 sm:bottom-5">
      {open ? (
        <div className="flex h-[min(34rem,calc(100dvh-1.5rem))] w-full flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 sm:w-96">
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">Assistente Neto STP</p>
              <p className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                <span className="size-1.5 rounded-full bg-green-400" />
                Responde na hora
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-8 items-center justify-center rounded-full text-primary-foreground/80 transition hover:bg-primary-foreground/15 hover:text-primary-foreground"
              aria-label="Fechar chat"
            >
              <X className="size-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-3 py-4 scrollbar-thin"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-end gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "bot" && (
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="size-3" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    message.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border bg-background text-foreground shadow-xs"
                  )}
                >
                  <MessageText text={message.text} onNavigate={() => setOpen(false)} />
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="size-3" />
                </div>
                <div className="flex gap-1 rounded-2xl rounded-bl-md border bg-background px-3.5 py-3 shadow-xs">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {messages.length === 1 && !isTyping && (
              <div className="flex flex-wrap gap-2 pl-8">
                {QUICK_REPLIES.map((quickReply) => (
                  <button
                    key={quickReply.label}
                    type="button"
                    onClick={() => sendQuestion(quickReply.question)}
                    className="rounded-full border border-primary/30 bg-background px-3 py-1.5 text-xs font-medium text-primary transition hover:border-primary hover:bg-primary/5"
                  >
                    {quickReply.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {messages.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto border-t bg-background px-3 py-2 scrollbar-none">
              {QUICK_REPLIES.map((quickReply) => (
                <button
                  key={quickReply.label}
                  type="button"
                  onClick={() => sendQuestion(quickReply.question)}
                  disabled={isTyping}
                  className="shrink-0 rounded-full border border-primary/30 px-2.5 py-1 text-xs whitespace-nowrap text-primary transition hover:bg-primary/5 disabled:opacity-50"
                >
                  {quickReply.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t bg-background p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escreve a tua pergunta..."
              aria-label="Pergunta"
              className="h-10 min-w-0 flex-1 rounded-full border bg-muted/40 px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
              aria-label="Enviar"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir chat de apoio"
          className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 hover:bg-primary/90"
        >
          <MessageCircle className="size-6" />
        </button>
      )}
    </div>
  );
}
