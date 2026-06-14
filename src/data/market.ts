import type { MarketListing } from "@/types";
import { getSeedCardById } from "./cards";

const c = (id: string) => getSeedCardById(id)!;

function iso(hoursAgo: number) {
  return new Date(Date.now() - hoursAgo * 3600_000).toISOString();
}

export const marketListings: MarketListing[] = [
  { id: "m-001", card: c("card-001"), price: 1450, sellerName: "NeonReaver", listedAt: iso(2) },
  { id: "m-002", card: c("card-005"), price: 720, sellerName: "JettMain", listedAt: iso(5) },
  { id: "m-003", card: c("card-002"), price: 680, sellerName: "ToxicQueen", listedAt: iso(9) },
  { id: "m-004", card: c("card-016"), price: 640, sellerName: "EmpressR", listedAt: iso(13) },
  { id: "m-005", card: c("card-008"), price: 360, sellerName: "OneShotOliver", listedAt: iso(20) },
  { id: "m-006", card: c("card-012"), price: 340, sellerName: "ShadowStep", listedAt: iso(26) },
  { id: "m-007", card: c("card-003"), price: 310, sellerName: "WireTap", listedAt: iso(30) },
  { id: "m-008", card: c("card-020"), price: 1380, sellerName: "WildGuide", listedAt: iso(34) },
  { id: "m-009", card: c("card-006"), price: 120, sellerName: "TapTapTap", listedAt: iso(41) },
  { id: "m-010", card: c("card-013"), price: 95, sellerName: "BoomBaby", listedAt: iso(48) },
];
