const app = require("../app");
const request = require("supertest")(app);
const server = app.listen(process.env.PORT || 3000);

const mongoose = require("mongoose");

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});

describe("Application Health Test", () => {

    // Check Health
    it("Application should be healthy", async () => {
        await request.get("/health")
            .auth(process.env.APPLICATION_MASTER_USERNAME, process.env.APPLICATION_MASTER_PASSWORD)
            .expect(200);
    });

});