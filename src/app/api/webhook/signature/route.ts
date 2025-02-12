import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Secret from "@/models/Secret";

// POST /api/webhook/signature - Generate webhook signature
export const POST = signaturePost;

async function signaturePost(request: NextRequest) {
    try {
        const payload = await request.json();
        const secret = request.headers.get("x-webhook-secret");

        await connectDB();

        const secretDb = await Secret.findOne({ value: secret });
        if (!secretDb) {
            return NextResponse.json(
                { error: "Webhook secret not found" },
                { status: 500 }
            );
        }

        const timestamp = Math.floor(Date.now() / 1000);

        const signature = crypto
            .createHmac("sha256", secret!)
            .update(`${timestamp}.${JSON.stringify(payload)}`)
            .digest("hex");

        return NextResponse.json({
            signature,
            timestamp,
            message: "Signature generated successfully",
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
