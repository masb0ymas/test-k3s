import express from "express";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { loadConfig } from "./config/index.js";
import { initializeK8sClients } from "./config/k8s.config.js";

const app = express();

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

/**
 * Initializes and starts the application
 * Validates configuration and Kubernetes connectivity before starting HTTP server
 */
async function startServer(): Promise<void> {
  try {
    // Step 1: Load and validate configuration
    console.log('📋 Loading configuration...');
    const config = loadConfig();
    console.log(`✅ Configuration loaded successfully (Environment: ${config.nodeEnv})`);

    // Step 2: Initialize Kubernetes clients and verify connectivity
    console.log('🔌 Initializing Kubernetes clients...');
    await initializeK8sClients();
    console.log('✅ Kubernetes connectivity verified');

    // Step 3: Start HTTP server only after successful initialization
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`🚀 K3s Backend API running on http://localhost:${PORT}`);
      console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`❤️  Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    // Log descriptive error and exit with non-zero status code
    console.error('❌ Failed to start application:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      
      // Log stack trace for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    } else {
      console.error('   Unknown error occurred');
    }
    
    console.error('\n💡 Please fix the above issues and try again.');
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
