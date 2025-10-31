<!-- df297bb7-f264-4bff-a9b0-6f71938e4224 132541a6-ef37-4ee4-ae8b-4cdc2d24a690 -->
# Plan: Use Equipped Car Images Everywhere

## Backend (Socket payloads)

- On join-waiting and race-started, include each player’s equipped car image URL.
- Lookup `User` by username or userId; resolve image from catalog by `equipped.carSku` -> `ShopItem.meta.image`.
- Emit `waiting-state` players: `{ username, socketId, imageUrl }`.
- Emit `race-started` players: `{ username, socketId, imageUrl }`.

## Frontend

- Garage (already uses imageUrl):
- `CarViewer` uses car image — keep.
- `CarCarousel` shows thumbnails from `meta.image` — done in Shop; mirror if needed.
- Shop (already shows images):
- Grid cards render `item.meta.image` — keep.
- Multiplayer:
- `WaitingLobby`: render car image beside each player lane using `player.imageUrl`.
- `RacingView`: show each racer’s car with their image; move along track by progress.
- Single Player Race:
- `GameBoard` (or `RaceTrack` component): show current user’s equipped car image.
- Fetch via `api.me()` at mount to get `equipped.carSku` then resolve image from catalog (cache catalog client-side).

## Data helpers

- Add a small resolver: given `equipped.carSku`, map to catalog item and return `meta.image`.
- Use client cache for catalog to avoid repeated calls.

## Notes

- Fallback: if image missing, use default basic car.
- Keep images responsive with object-contain; consistent canvas (e.g., 520×160) for alignment.

### To-dos

- [ ] Emit equipped car imageUrl in waiting-state and race-started payloads
- [ ] Show car images in WaitingLobby lanes
- [ ] Show car images moving along track in RacingView
- [ ] Show equipped car in single-player race (resolve from catalog)