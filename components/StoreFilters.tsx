"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: string; slug: string; name: string };

type Filters = { q: string; categoria: string; sort: string };

export function StoreFilters({
  categories,
  defaultValues,
}: {
  categories: Category[];
  defaultValues: Filters;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValues.q);
  const [categoria, setCategoria] = useState(defaultValues.categoria);
  const [sort, setSort] = useState(defaultValues.sort);

  function applyFilters(next: Partial<Filters>) {
    const values = { q, categoria, sort, ...next };
    const params = new URLSearchParams();
    if (values.q) params.set("q", values.q);
    if (values.categoria) params.set("categoria", values.categoria);
    if (values.sort) params.set("sort", values.sort);
    router.push(`/loja?${params.toString()}`);
  }

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      applyFilters({ q });
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters({});
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <Input
        placeholder="Pesquisar produtos..."
        value={q}
        onChange={(event) => setQ(event.target.value)}
        className="sm:max-w-xs"
      />

      <Select
        value={categoria || "all"}
        onValueChange={(value) => {
          const next = !value || value === "all" ? "" : value;
          setCategoria(next);
          applyFilters({ categoria: next });
        }}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sort || "recent"}
        onValueChange={(value) => {
          const next = !value || value === "recent" ? "" : value;
          setSort(next);
          applyFilters({ sort: next });
        }}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Mais recentes</SelectItem>
          <SelectItem value="price-asc">Preço: menor primeiro</SelectItem>
          <SelectItem value="price-desc">Preço: maior primeiro</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}
