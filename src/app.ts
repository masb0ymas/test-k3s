import express from "express";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api", routes);

// Error handling
app.use(errorMiddleware);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 K3s Backend API running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});

export default app;
