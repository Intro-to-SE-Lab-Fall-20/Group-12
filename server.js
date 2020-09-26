const dotenv = require("dotenv");
// Load env variables from .env file
dotenv.config({
    path: (process.env.NODE_ENV === "production") ? ".env.prod" : ".env.dev"
});

const os = require("os");
const app = require("./app");

// Startup the express server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server started in ${app.get("env")} mode on port ${port}`);
});