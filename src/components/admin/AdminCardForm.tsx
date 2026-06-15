"use client";

import { useState } from "react";
import type { Card, CardSet, RarityConfig, CardTypeConfig, CardRole } from "@/types";
import { AdminFormDrawer } from "./AdminFormDrawer";
import { Field, TextInput, NumberInput, TextArea, Select, Toggle } from "./fields";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { slugify, uid } from "@/lib/utils";

const ROLES: CardRole[] = ["duelist", "controller", "sentinel", "initiator", "neutral"];

export function AdminCardForm({
  open, initial, sets, rarities, types, onClose, onSave,
}: {
  open: boolean;
  initial: Card | null;
  sets: CardSet[];
  rarities: RarityConfig[];
  types: CardTypeConfig[];
  onClose: () => void;
  onSave: (card: Card) => void;
}) {
  const blank: Card = {
    id: uid("card"), setId: sets[0]?.id ?? "set-genesis", name: "", slug: "",
    rarity: rarities[0]?.id ?? "common", rarityId: rarities[0]?.id ?? "common",
    type: types[0]?.id ?? "agent", typeId: types[0]?.id ?? "agent",
    role: "neutral", description: "", image: "/images/cards/",
    ownedAmount: 0, tradable: true, fusionValue: 100,
    isLimited: false, isAnimated: false, isFeatured: false,
    tags: [], createdAt: new Date().toISOString(), isActive: true,
  };
  const [card, setCard] = useState<Card>(initial ?? blank);
  const set = <K extends keyof Card>(k: K, v: Card[K]) => setCard((c) => ({ ...c, [k]: v }));

  const submit = () => {
    const final: Card = {
      ...card,
      slug: card.slug || slugify(card.name),
      rarityId: card.rarity, typeId: card.type,
      tags: typeof card.tags === "string" ? String(card.tags).split(",").map((t) => t.trim()).filter(Boolean) : card.tags,
    };
    onSave(final);
  };

  return (
    <AdminFormDrawer open={open} title={initial ? "Edit card" : "New card"} onClose={onClose} onSubmit={submit}>
      <Field label="Name"><TextInput value={card.name} onChange={(v) => set("name", v)} placeholder="Phoenix Ignis" /></Field>
      <Field label="Slug" hint="Auto-generated from name if left blank">
        <TextInput value={card.slug} onChange={(v) => set("slug", v)} placeholder="phoenix-ignis" />
      </Field>
      <Field label="Set">
        <Select value={card.setId} onChange={(v) => set("setId", v)} options={sets.map((s) => ({ value: s.id, label: s.name }))} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rarity">
          <Select value={card.rarity} onChange={(v) => { set("rarity", v); set("rarityId", v); }} options={rarities.map((r) => ({ value: r.id, label: r.name }))} />
        </Field>
        <Field label="Type">
          <Select value={card.type} onChange={(v) => { set("type", v); set("typeId", v); }} options={types.map((t) => ({ value: t.id, label: t.name }))} />
        </Field>
      </div>
      <Field label="Role">
        <Select value={card.role} onChange={(v) => set("role", v as CardRole)} options={ROLES.map((r) => ({ value: r, label: r }))} />
      </Field>
      <Field label="Description"><TextArea value={card.description} onChange={(v) => set("description", v)} /></Field>
      <Field label="Card image" hint="Drag & drop an image, or paste a URL below">
        <ImageUploader value={card.image?.startsWith("http") ? card.image : ""} shape="wide" label="Upload card art"
          onUploaded={(url) => set("image", url)} />
        <div className="mt-2">
          <TextInput value={card.image} onChange={(v) => set("image", v)} placeholder="https://… or /images/cards/…" />
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fusion value"><NumberInput value={card.fusionValue} onChange={(v) => set("fusionValue", v)} min={0} /></Field>
        <Field label="Seed owned amount"><NumberInput value={card.ownedAmount} onChange={(v) => set("ownedAmount", v)} min={0} /></Field>
      </div>
      <Field label="Tags" hint="Comma-separated">
        <TextInput value={Array.isArray(card.tags) ? card.tags.join(", ") : card.tags} onChange={(v) => set("tags", v as unknown as string[])} />
      </Field>
      <Toggle checked={card.tradable} onChange={(v) => set("tradable", v)} label="Tradable on market" />
      <Toggle checked={card.isLimited} onChange={(v) => set("isLimited", v)} label="Limited edition" />
      <Toggle checked={card.isAnimated} onChange={(v) => set("isAnimated", v)} label="Animated" />
      <Toggle checked={card.isFeatured} onChange={(v) => set("isFeatured", v)} label="Featured" />
      <Toggle checked={card.isActive} onChange={(v) => set("isActive", v)} label="Active (visible in app)" />
    </AdminFormDrawer>
  );
}
