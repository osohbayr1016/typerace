# Database Setup Instructions

## Quick Start

### 1. Database Configuration
The application is configured to use the **typeracer** database on MongoDB Atlas.

**Connection Details:**
- Database Name: `typeracer`
- Full Connection String: `mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer?retryWrites=true&w=majority`

### 2. Environment Variables
The `.env` file in the backend directory contains:
```
MONGODB_URI=mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
COOKIE_NAME=auth_token
CLIENT_ORIGIN=http://localhost:3000
```

### 3. Run Migration
To populate the database with sample data:

```bash
cd backend
npx ts-node migrate.ts
```

This will create:
- 12 users (with varying skill levels)
- 10 shop items (cars, skins, boosts)
- 1 current season record

### 4. Start the Server

**Development mode:**
```bash
cd backend
npm run dev
```

**Production mode:**
```bash
cd backend
npm run build
npm start
```

## Test Credentials

You can login with any of these accounts:
```
Email: admin@typerace.mn
Password: password123
```

All seeded users (except Guest accounts) use the same password: `password123`

## Available Users

1. **admin@typerace.mn** - Admin (Level 50, 120 WPM)
2. **speedster@typerace.mn** - Speedster (Level 45, 115 WPM)
3. **champion@typerace.mn** - Champion (Level 40, 110 WPM)
4. **racer@typerace.mn** - Racer (Level 35, 105 WPM)
5. **typer@typerace.mn** - Typer (Level 30, 100 WPM)
6. **fast@typerace.mn** - Fast (Level 25, 95 WPM)
7. **novice@typerace.mn** - Novice (Level 20, 90 WPM)
8. **beginner@typerace.mn** - Beginner (Level 15, 85 WPM)
9. **newbie@typerace.mn** - Newbie (Level 10, 80 WPM)
10. **fresh@typerace.mn** - Fresh (Level 5, 70 WPM)
11. **guest1@typerace.mn** - Guest1 (Level 1, no password)
12. **guest2@typerace.mn** - Guest2 (Level 1, no password)

## Reset Database

To clear and repopulate the database:

```bash
cd backend
npx ts-node migrate.ts
```

⚠️ **Warning**: This will delete all existing data!

## Collections in typeracer Database

- **users** - User accounts and statistics
- **races** - Race history and results
- **shopitems** - Shop catalog items
- **inventories** - User purchased items
- **transactions** - Economic transactions
- **taskclaims** - Daily/weekly task completions
- **achievementunlocks** - Achievement progress
- **seasons** - Season information

## Troubleshooting

### Connection Issues
- Ensure you have internet connectivity
- Check that the MongoDB Atlas cluster is running
- Verify the connection string is correct in `.env`

### Migration Errors
- Make sure you're in the backend directory
- Ensure all npm dependencies are installed: `npm install`
- Check that TypeScript is installed: `npm install -D typescript ts-node`

### Port Already in Use
If port 5000 is already in use, you can change it in the `.env` file:
```
PORT=5001
```


