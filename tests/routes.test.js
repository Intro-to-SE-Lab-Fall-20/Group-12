const app = require("../app");
const request = require("supertest")(app);
const server = app.listen(process.env.PORT || 3000);

const mongoose = require("mongoose");

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});

describe("Route Tests", () => {
    // Authenticated Testing???
    // We are using OAuth, so we aren't able to test authenticated login without having to Mock the entire OAuth flow


    // Unauthenticated tests on endpoints
    it('[Unauthenticated] GET /inbox - User should be redirected to /', async () => {
        await request.get("/inbox").expect(302).expect("location", "/");
    });

    it('[Unauthenticated] GET /message/1 - User should be redirected to /', async () => {
        await request.get("/message/1").expect(302).expect("location", "/");
    });

    it('[Unauthenticated] GET /message/1/file/1 - User should be redirected to /', async () => {
        await request.get("/message/1/file/1").expect(302).expect("location", "/");
    });

    it('[Unauthenticated] GET /compose - User should be redirected to /', async () => {
        await request.get("/compose").expect(302).expect("location", "/");
    });
});