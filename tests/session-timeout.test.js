const app = require("../app");
// const request = require("supertest")(app);
const request = require("supertest-session")(app);
const server = app.listen(process.env.PORT || 3000);

const mongoose = require("mongoose");

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});

describe("[SESSION] Session Lockout Tests", () => {

    const attempts = process.env.APPLICATION_FAILED_LOGIN_ATTEMPTS;
    it(`[SESSION] Application should lockout user on ${attempts} attempts`, async () => {
        for (let i = 0; i < attempts; i++) {
            await request.get("/mail/auth/failure")
                .auth(process.env.APPLICATION_MASTER_USERNAME, process.env.APPLICATION_MASTER_PASSWORD)
                .expect(302);
        }

        await request.get("/mail/auth/google")
            .auth(process.env.APPLICATION_MASTER_USERNAME, process.env.APPLICATION_MASTER_PASSWORD)
            .expect(401);
    });

    const timeout = Number(process.env.APPLICATION_FAILED_LOGIN_TIMEOUT);
    const timeoutBuffer = (timeout + 5) * 1000;
    it(`[SESSION] Application should unlock user after ${timeout} seconds`, async () => {
        // Delay 5 seconds after timeout
        await new Promise(resolve => setTimeout(resolve, timeoutBuffer));
        const res = await request.get("/mail/auth/google")
            .auth(process.env.APPLICATION_MASTER_USERNAME, process.env.APPLICATION_MASTER_PASSWORD)
            .expect(302);
    }, timeoutBuffer + 1000);

});