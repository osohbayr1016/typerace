# Database Migration Summary

## Overview
Successfully migrated the Type Race database to MongoDB Atlas cloud instance using the **typeracer** database.

## Connection Details
- **Database**: typeracer
- **Connection String**: mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer?retryWrites=true&w=majority

## Collections Created

### 1. Users (12 total)
Collection of user accounts with various skill levels:

**Authenticated Users** (password: `password123`):
- admin@typerace.mn (Admin) - Level 50, 120 WPM, 150 wins
- speedster@typerace.mn (Speedster) - Level 45, 115 WPM, 120 wins
- champion@typerace.mn (Champion) - Level 40, 110 WPM, 100 wins
- racer@typerace.mn (Racer) - Level 35, 105 WPM, 80 wins
- typer@typerace.mn (Typer) - Level 30, 100 WPM, 60 wins
- fast@typerace.mn (Fast) - Level 25, 95 WPM, 45 wins
- novice@typerace.mn (Novice) - Level 20, 90 WPM, 30 wins
- beginner@typerace.mn (Beginner) - Level 15, 85 WPM, 20 wins
- newbie@typerace.mn (Newbie) - Level 10, 80 WPM, 12 wins
- fresh@typerace.mn (Fresh) - Level 5, 70 WPM, 5 wins

**Guest Users** (no password):
- guest1@typerace.mn (Guest1) - New player
- guest2@typerace.mn (Guest2) - New player

### 2. Shop Items (10 total)
- **Cars**:
  - Starter Car (100 coins) - Common
  - Sportster (500 coins) - Rare
  - Racer X (800 coins) - Rare
  - Speed Demon (1200 coins) - Epic
  - Nitro Beast (2000 coins) - Legendary

- **Skins**:
  - Flame Skin (300 coins) - Epic
  - Ice Skin (350 coins) - Epic
  - Rainbow Skin (500 coins) - Legendary

- **Boosts**:
  - XP Booster (50 coins) - Common
  - Coin Doubler (100 coins) - Rare

### 3. Season
- Current Season: 2025-10 (Winter Championship)
- Status: Active

## User Data Fields
Each user contains:
- Email & Username
- Password hash (bcrypt)
- Level & Experience
- Money/Coins
- MMR (Match Making Rating)
- Wins count
- Best WPM
- Total races
- Average accuracy
- Account creation date

## Test Credentials
```
Email: admin@typerace.mn
Password: password123
```

You can use these credentials for any of the seeded users (except Guest accounts).

## Running the Migration Again
To reset and repopulate the database:

```bash
cd backend
npx ts-node migrate.ts
```

This will:
1. Clear all existing data
2. Re-seed with the sample data
3. Display success message with login credentials

## Next Steps
1. Start the backend server: `npm run dev`
2. Start the frontend: `cd ../frontend && npm run dev`
3. Access the application at http://localhost:3000
4. Login with the credentials above to test the system

