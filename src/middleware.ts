import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
    // Skip authentication for public routes
    if (req.url.includes("/api/users") && req.method === "POST") {
        return;
    }

    // Check authentication for protected API routes
    if (req.url.includes("api") && !req.url.includes("cron")) {
        const authHeader = req.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { message: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return NextResponse.json(
                { message: "Server configuration error" },
                { status: 500 }
            );
        }

        try {
            jwt.verify(token, jwtSecret);
        } catch (error: unknown) {
            console.error(
                "Token verification failed:",
                error instanceof Error ? error.message : "Unknown error"
            );
            return NextResponse.json(
                { message: "Unauthorized - Invalid token" },
                { status: 401 }
            );
        }
    }
}

// Helper function to generate JWT tokens
export function generateToken(payload: object): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return jwt.sign(payload, secret, { expiresIn: "24h" });
}

// Helper function to verify JWT tokens
export function verifyToken(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    try {
        return jwt.verify(token, secret);
    } catch (error: unknown) {
        return {
            error: error instanceof Error ? error.message : "Invalid token",
        };
    }
}
