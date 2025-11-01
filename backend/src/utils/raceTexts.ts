export const raceTexts = [
  "The quick brown fox jumps over the lazy dog near the riverbank.",
  "Programming is the art of telling another human what one wants the computer to do.",
  "TypeScript is a strongly typed programming language that builds on JavaScript.",
  "Practice makes perfect when learning to type faster and more accurately.",
  "The best time to plant a tree was twenty years ago. The second best time is now.",
  "In the middle of difficulty lies opportunity waiting to be discovered.",
  "The only way to do great work is to love what you do every single day.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Coding is not just about writing code, it's about solving problems creatively.",
  "Web development requires patience, practice, and a passion for learning new things.",
  "React makes it painless to create interactive user interfaces for your applications.",
  "MongoDB is a document database with the scalability and flexibility that you want.",
  "Socket.io enables real-time bidirectional event-based communication between clients.",
  "Express is a minimal and flexible Node.js web application framework.",
  "The journey of a thousand miles begins with a single step forward.",
  "Don't watch the clock; do what it does. Keep going at your own pace.",
  "Believe you can and you're halfway there to achieving your goals.",
  "Quality is not an act, it is a habit that we build over time.",
  "The only impossible journey is the one you never start today."
];

export const getRandomRaceText = (): string => {
  return raceTexts[Math.floor(Math.random() * raceTexts.length)];
};

