const app = require("../app");
const request = require("supertest")(app);
const server = app.listen(process.env.PORT || 3000);

const mongoose = require("mongoose");

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});

describe("[MAIL] Application Tests", () => {

    it("[MAIL] Application should require master password authentication", async () => {
        await request.get("/mail").expect(401);
    });

    it("[MAIL] Application should require secondary authentication", async () => {
        await request.get("/mail/inbox")
            .auth(process.env.APPLICATION_MASTER_USERNAME, process.env.APPLICATION_MASTER_PASSWORD)
            .expect(302);
    });

});