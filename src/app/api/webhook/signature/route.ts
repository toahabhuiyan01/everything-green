import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// POST /api/webhook/signature - Generate webhook signature
export async function POST(request: NextRequest) {
    try {
        const webhookSecret = process.env.WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error("Webhook secret is not configured");
        }

        const payload = await request.text();

        // Generate HMAC SHA-256 signature
        const hmac = crypto.createHmac("sha256", webhookSecret);
        const signature = hmac.update(payload).digest("hex");

        return NextResponse.json({
            signature,
            message: "Signature generated successfully",
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
