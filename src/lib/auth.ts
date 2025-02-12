import jwt from "jsonwebtoken";

const KEYS = {
    private_key: process.env.PRIVATE_KEY,
    public_key: process.env.PUBLIC_KEY,
};

const JWT_ALG = "RS256";

const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----\n${KEYS.private_key}\n-----END RSA PRIVATE KEY-----`;
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----\n${KEYS.public_key}\n-----END PUBLIC KEY-----`;

export interface JWTPayload {
    userId: string;
    email: string;
}

export function generateToken(payload: object): string {
    if (!KEYS.private_key) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(payload, PRIVATE_KEY, {
        expiresIn: "24h",
        algorithm: JWT_ALG,
    });
}

export function verifyToken(token: string): JWTPayload {
    if (!KEYS.public_key) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.verify(token, PUBLIC_KEY, {
        algorithms: [JWT_ALG],
    }) as JWTPayload;
}

export function verifyAuthHeader(authHeader: string | null): {
    isValid: boolean;
    payload?: JWTPayload;
    error?: string;
} {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { isValid: false, error: "No token provided" };
    }

    try {
        const token = authHeader.split(" ")[1];
        const payload = verifyToken(token);
        return { isValid: true, payload };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : "Invalid token",
        };
    }
}
