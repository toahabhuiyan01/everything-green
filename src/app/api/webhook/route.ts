import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Webhook from "@/models/Webhook";

// Schema for webhook payload validation
const webhookSchema = z.object({
    eventType: z.string(),
    data: z.record(z.unknown()),
});

// Function to verify webhook signature
function verifySignature(
    payload: string,
    signature: string | null,
    secret: string
): boolean {
    if (!signature) return false;

    const hmac = crypto.createHmac("sha256", secret);
    const calculatedSignature = hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(calculatedSignature)
    );
}

// Function to store webhook data
async function storeWebhookData(data: unknown, userId: string) {
    await connectDB();
    const webhook = await Webhook.create({
        userId,
        eventType: (data as { eventType: string }).eventType,
        data: (data as { data: Record<string, unknown> }).data,
    });
    return webhook;
}

// POST /api/webhook - Process webhook requests
export async function POST(request: NextRequest) {
    try {
        const webhookSecret = process.env.WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error("Webhook secret is not configured");
        }

        const payload = await request.text();
        const signature = request.headers.get("x-webhook-signature");

        if (!verifySignature(payload, signature, webhookSecret)) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        const body = JSON.parse(payload);
        const validatedData = webhookSchema.parse(body);

        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json(
                { error: "User ID not found in request" },
                { status: 401 }
            );
        }

        // Store webhook data with user ID
        await storeWebhookData(validatedData, userId);

        return NextResponse.json({
            success: true,
            message: "Received",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
