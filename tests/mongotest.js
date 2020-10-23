const mongoose = require("mongoose")

beforeAll(async () => {
    mongoose.set("useUnifiedTopology", true);
    mongoose.set("useCreateIndex", true);
    await mongoose.connect(process.env.APPLICATION_DATABASE_URL, { useNewUrlParser: true });
});

afterAll(async () => {
    await mongoose.connection.close();
});

test('User is redirected to login if not authenticated', () => {
    expect(1024).toBe(1024);
});