module.exports = (url) => {
    const mongoose = require("mongoose");

    try {
        mongoose.set("useUnifiedTopology", true);
        mongoose.set("useCreateIndex", true);
        mongoose.connect(url || "", {
            useNewUrlParser: true
        });

        mongoose.connection.on("connected", () => {
            console.log("Connection to MongoDB Established");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("Connection to MongoDB Reestablished");
        });

        mongoose.connection.on("close", () => {
            console.log("Connection to MongoDB Closed");
        });

        mongoose.connection.on("error", (error) => {
            console.error("ERROR: ", error);
        });

        return mongoose;

    } catch (error) {
        console.error(error);
        process.exit(0);
    }
};