import axios from "axios";

const baseURL = process.env.DEV_SERVER_URL || "http://localhost:3000/api";
let authToken: string;
let userId: string;
let secret: string;

describe("Application Integration Tests", () => {
    const testUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
    };

    describe("1. User Authentication", () => {
        test("1.1 Should register a new user", async () => {
            const response = await axios.post(`${baseURL}/users`, testUser);
            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty("user");
            expect(response.data.user).toHaveProperty("_id");
            userId = response.data.user._id;
        });

        test("1.2 Should login with registered user", async () => {
            const response = await axios.post(`${baseURL}/auth/login`, {
                email: testUser.email,
                password: testUser.password,
            });
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty("token");
            authToken = response.data.token;
        });
    });

    describe("2. User Management", () => {
        test("2.1 Should get all users", async () => {
            const response = await axios.get(`${baseURL}/users`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data.length).toBeGreaterThan(0);
        });

        test("2.2 Should get a specific user", async () => {
            const response = await axios.get(`${baseURL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data._id).toBe(userId);
            expect(response.data.email).toBe(testUser.email);
        });
    });

    describe("3. Secret Management", () => {
        const testSecret = {
            name: "Test Secret",
            value: "secret123",
        };

        test("3.1 Should create a new secret", async () => {
            const response = await axios.post(
                `${baseURL}/webhook/secret`,
                testSecret,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );
            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty("secret");
        });

        test("3.2 Should fetch user's secrets", async () => {
            const response = await axios.get(`${baseURL}/webhook/secret`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data.secrets)).toBe(true);
            expect(response.data.secrets.length).toBeGreaterThan(0);

            secret = response.data.secrets[0].value;
        });
    });

    describe("4. Webhook Operations", () => {
        test("4.1 Should generate webhook signature", async () => {
            const response = await axios.post(
                `${baseURL}/webhook/signature`,
                {},
                {
                    headers: {
                        "x-webhook-secret": secret,
                        "Content-Type": "text/plain",
                    },
                }
            );
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty("signature");
            expect(response.data).toHaveProperty("timestamp");
        });

        test("4.2 Should post webhook with valid signature", async () => {
            const webhookPayload = {
                event: "test_event",
                data: {
                    key: "value",
                    timestamp: Date.now(),
                },
            };

            const signatureRes = await axios.post(
                `${baseURL}/webhook/signature`,
                webhookPayload,
                {
                    headers: {
                        "x-webhook-secret": secret,
                        "Content-Type": "text/plain",
                    },
                }
            );

            const response = await axios.post(
                `${baseURL}/webhook`,
                webhookPayload,
                {
                    headers: {
                        "x-webhook-secret": secret,
                        "x-webhook-timestamp": signatureRes.data.timestamp,
                        "x-webhook-signature": signatureRes.data.signature,
                        "Content-Type": "application/json",
                    },
                }
            );

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data).toHaveProperty("data");
        });

        test("4.3 Should reject webhook with invalid signature", async () => {
            const webhookPayload = {
                eventType: "test_event",
                data: {
                    key: "value",
                    timestamp: Date.now(),
                },
            };

            await expect(
                axios.post(`${baseURL}/webhook`, webhookPayload, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "x-webhook-signature": "invalid_signature",
                        "Content-Type": "application/json",
                    },
                })
            ).rejects.toThrow();
        });
    });
});
