// ─── Sound hooks (stubbed) ──────────────────────────────────────────
// No real audio is bundled. These are no-op hooks so the pack-opening flow
// can trigger sound events; wire real <audio> playback here later if desired.

export type SoundEvent = "pack_open" | "card_flip" | "rare_hit" | "legendary_hit";

export function playSound(event: SoundEvent): void {
  // Intentionally a no-op in this build. Example future implementation:
  //   const el = new Audio(`/sounds/${event}.mp3`); el.volume = 0.5; el.play();
  if (typeof window !== "undefined") {
    // Dispatch a custom event so a future audio manager could subscribe.
    window.dispatchEvent(new CustomEvent("ascendant:sound", { detail: event }));
  }
}
