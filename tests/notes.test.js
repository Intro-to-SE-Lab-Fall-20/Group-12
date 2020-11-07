const app = require("../app");
const request = require("supertest")(app);
const server = app.listen(process.env.PORT || 3000);

const mongoose = require("mongoose");

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});

describe("[NOTES] Application Tests", () => {

    it("[NOTES] Application should require master password authentication", async () => {
        await request.get("/notes").expect(401);
    });

    it("[NOTES] Application should not require secondary authentication", async () => {
        await request.get("/notes")
            .auth(process.env.APPLICATION_MASTER_USERNAME, process.env.APPLICATION_MASTER_PASSWORD)
            .expect(200);
    });

});