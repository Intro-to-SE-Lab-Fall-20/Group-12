require("dotenv").config();

const os = require("os");
const app = require("./app");

// Startup the express server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server started in ${app.get("env")} mode on port ${port}`);
});

// Handle graceful shutdown of cluster worker
const gracefulShutdown = async () => {
    // Shutdown express server
    server.close(async () => {
        console.log("HTTP server closed");

        // Disconnect from mongoose
        // await mongoose.default.disconnect();
    });
};

process.on("SIGTERM", gracefulShutdown);