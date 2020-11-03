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
    it('[Unauthenticated] GET /mail/inbox - User should be given a 401 - Unauthorized', async () => {
        await request.get("/mail/inbox").expect(401);
    });

    it('[Unauthenticated] GET /mail/message/1 - User should be given a 401 - Unauthorized', async () => {
        await request.get("/mail/message/1").expect(401);
    });

    it('[Unauthenticated] GET /mail/message/1/file/1 - User should be given a 401 - Unauthorized', async () => {
        await request.get("/mail/message/1/file/1").expect(401);
    });

    it('[Unauthenticated] GET /mail/compose - User should be given a 401 - Unauthorized', async () => {
        await request.get("/mail/compose").expect(401);
    });
});