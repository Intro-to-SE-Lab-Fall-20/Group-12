const os = require("os");
const app = require("./app");

// Startup the express server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`Server started in ${app.get("env")} mode on port ${port}`);
});