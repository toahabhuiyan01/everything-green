import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import crypto from "crypto";
import Secret from "@/models/Secret";
import Webhook from "@/models/Webhook";

// POST /api/webhook - Process webhook
export const POST = webhookPost;

async function webhookPost(request: NextRequest) {
    try {
        const payload = await request.json();
        const secret = request.headers.get("x-webhook-secret");
        await dbConnect();

        const secretDb = await Secret.findOne({ value: secret });
        if (!secretDb) {
            return NextResponse.json(
                { error: "Webhook secret not found" },
                { status: 500 }
            );
        }

        const incomingSignature = request.headers.get("x-webhook-signature");
        const timestamp = request.headers.get("x-webhook-timestamp");

        if (!incomingSignature || !timestamp) {
            return NextResponse.json(
                { error: "Missing webhook signature or timestamp" },
                { status: 401 }
            );
        }

        // Verify timestamp is within acceptable range (5 minutes)
        const currentTime = Math.floor(Date.now() / 1000);
        const timestampNum = parseInt(timestamp);

        if (isNaN(timestampNum) || Math.abs(currentTime - timestampNum) > 300) {
            return NextResponse.json(
                { error: "Invalid timestamp or request expired" },
                { status: 401 }
            );
        }

        const hmac = crypto.createHmac("sha256", secret!);
        const expectedSignature = hmac
            .update(`${timestamp}.${JSON.stringify(payload)}`)
            .digest("hex");

        if (incomingSignature !== expectedSignature) {
            return NextResponse.json(
                { error: "Invalid webhook signature" },
                { status: 401 }
            );
        }

        const { event, data } = payload;
        const saved = await Webhook.create({
            event,
            data,
            userId: secretDb.userId,
        });

        return NextResponse.json({
            success: true,
            message: "Webhook processed successfully",
            data: saved,
        });
    } catch (error) {
        console.error("Webhook processing error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
