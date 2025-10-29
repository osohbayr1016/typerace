<!-- e3a709a4-57fe-4332-b181-257c070c379f 08684eae-10c2-4a05-9810-400774b8d280 -->
# Nitrotype Parity: Priority Roadmap (High → Low Impact)

## 1) Leagues + Ranked Progression

- Add MMR, divisions (e.g., Bronze→Challenger), promotion/demotion rules
- Season placement based on MMR; end-of-season rewards and reset
- UI: league badge in Navbar, profile, race intro; league page with thresholds

## 2) Season Lifecycle + Rewards

- Season model (start/end, theme)
- Seasonal leaderboards archival and payout job
- Season pass claim job for cosmetics/currency; badge accrual

## 3) Shop UX + Garage Equip Flow

- Pages: Shop catalog, item details, purchase confirmation
- Garage: equip car/skin/trail; show equipped cosmetic in race UI
- Inventory management (filtering, rarity, preview)

## 4) Tasks (Dailies/Weeklies) + Streaks

- Add streak counters and streak rewards
- Expand task types (distance typed, accuracy, WPM milestones)
- UI: task list, progress bars, claim states, streak meter

## 5) Achievements + Badges on Profiles

- Richer achievements with tiers
- Badge rendering on profile and race intro overlay
- Achievement to reward mapping (cosmetics + currency)

## 6) Friends, Parties, Private Races

- Friend graph (requests/accept/blocked)
- Party lobby → private race with invite code
- Basic in-race quick emotes (safe)

## 7) Teams/Clans

- Team creation, roles, invites
- Team leaderboards, seasonal team rewards
- Team page with news and roster

## 8) Anti-cheat v2

- Keystroke cadence anomaly detection, device fingerprint signals
- Progressive penalties (warning → temp → shadowban)
- Admin review queue + tools

## 9) Payments/Membership

- Premium currency or membership (e.g., Gold), paywall for premium battle pass track
- Entitlements & receipts (stripe)
- Parental/teacher constraints later

## 10) Spectator/Replay

- Watch live races; simple replay from stored deltas
- Shareable links

## 11) Content + Ops

- Text snippet packs (difficulty/language filters)
- Shop rotations and time-limited banners
- Admin panel for items/seasons/users

---

## Near-term Implementation Slices (2-3 week bursts)

### Slice A (Leagues + Season skeleton)

- DB: `leagues` config, user.mmr, season doc, season rewards
- API: place/adjust MMR after each race; league endpoints; season status
- Job: season rollover, rewards distribution
- UI: league badge + league page, seasonal leaderboard tabs

### Slice B (Shop + Garage equip)

- Frontend pages for catalog and garage equip
- API: set equipped cosmetic; inventory read/write
- Race UI displays equipped items

### Slice C (Tasks + Streaks + Achievements UI)

- Add streak tracking; expand task defs
- UI for tasks/achievements with claim flows

### Slice D (Friends/Private races)

- Friends endpoints; party lobby and private race creation

---

## Key Files to Extend

- Backend: `backend/server.ts` (models, endpoints, rollover jobs)
- Frontend: `frontend/app/leaderboard/page.tsx`, `frontend/app/garage/page.tsx`, new `frontend/app/shop/page.tsx`, tasks/achievements widgets

### To-dos

- [ ] Add backend .env with MONGODB_URI and connect Mongoose in server.js
- [ ] Implement signup/login/logout and JWT cookie middleware
- [ ] Add Socket.IO server and namespaces for matchmaking/race
- [ ] Implement matchmaking queue and race creation logic
- [ ] Implement race lifecycle, progress validation, results storage
- [ ] Add login/register UI and auth context to Navbar
- [ ] Wire GameBoard and RaceTrack to Socket.IO events
- [ ] Add money/exp rewards, inventory and purchase flow
- [ ] Implement daily/weekly/seasonal leaderboards and jobs
- [ ] Implement tasks/quests/achievements and battle pass UI/APIs