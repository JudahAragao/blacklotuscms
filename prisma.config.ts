import "dotenv/config";
import { defineConfig } from "prisma/config";
import { readFileSync, existsSync } from "fs";
import path from "path";

// Helper to load secret from file (Zero .env architecture)
const getSecret = (key: string): string | undefined => {
  if (process.env[key]) return process.env[key];
  
  // Try .secrets.json (Local development/Installation result)
  const secretsPath = path.join(process.cwd(), ".secrets.json");
  if (existsSync(secretsPath)) {
    try {
      const secrets = JSON.parse(readFileSync(secretsPath, "utf-8"));
      if (secrets[key]) return secrets[key];
    } catch (e) {}
  }

  return undefined;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getSecret("DATABASE_URL") || "postgresql://postgres:password@localhost:5432/blacklotuscms",
  },
});