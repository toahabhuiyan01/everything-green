import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authMiddleware";
import dbConnect from "@/lib/db";
import Secret from "@/models/Secret";
import crypto from "crypto";

// POST /api/webhook/secret - Create a new webhook secret
export const POST = withAuth(secretPost);
// GET /api/webhook/secret - Return all the webhook secrets for the user
export const GET = withAuth(secretsGet);

async function secretPost(request: NextRequest) {
    try {
        const body = await request.json();
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID not found in request" },
                { status: 401 }
            );
        }

        const name = body.name;
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        await dbConnect();
        const secretValue =
            body.secret || crypto.randomBytes(32).toString("hex");

        await Secret.findOneAndUpdate(
            { userId },
            { userId, value: secretValue, name },
            { upsert: true, new: true }
        );

        return NextResponse.json(
            {
                secret: secretValue,
                message: "Webhook secret created successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating webhook secret:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

async function secretsGet(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json(
                { error: "User ID not found in request" },
                { status: 401 }
            );
        }

        await dbConnect();
        const secrets = await Secret.find({ userId });

        return NextResponse.json({
            secrets,
            message: "Webhook secret exists",
        });
    } catch (error) {
        console.error("Error checking webhook secret:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
