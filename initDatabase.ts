import { PrismaClient } from "@prisma/client/extension";

async function initDatabase() {
  const prisma = new PrismaClient();

  try {
    // Create extensions
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "vector"`;
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    console.log("Database extensions initialized successfully");
  } catch (error) {
    console.error("Error initializing database extensions:", error);
    // If the error is due to lack of permissions, log a more helpful message
    if (error.message.includes("permission denied")) {
      console.error(
        "Error: Insufficient permissions to create extensions. Please ensure your database user has the necessary privileges."
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Self-invoking function to run the initialization
(async () => {
  try {
    await initDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
})();

export default initDatabase;
