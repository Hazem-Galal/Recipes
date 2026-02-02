// server/src/index.ts
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import mealdbRouter from "./routes/mealdb.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============ Middleware ============
// Security headers
app.use(helmet());

// CORS - Allow client to call server
app.use(
  cors({
    origin: NODE_ENV === "production"
      ? process.env.CLIENT_URL || "https://yourdomain.com"
      : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Compression for responses
app.use(compression());

// JSON parsing
app.use(express.json());

// ============ Routes ============
// API routes (proxy to TheMealDB)
app.use("/api", mealdbRouter);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============ Error Handling ============
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({
    error: "Internal server error",
    message: NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// ============ Server Start ============
app.listen(PORT, () => {
  console.log(`🍽️  Recipes server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`🔌 TheMealDB API Base: ${process.env.MEALDB_API_BASE}`);
});
