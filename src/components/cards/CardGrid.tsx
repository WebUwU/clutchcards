import type { Card } from "@/types";
import { CardItem } from "./CardItem";

export function CardGrid({
  cards,
  onCardClick,
  selectable,
  selectedIds,
}: {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onClick={onCardClick}
          selectable={selectable}
          selected={selectedIds?.has(card.id)}
        />
      ))}
    </div>
  );
}
