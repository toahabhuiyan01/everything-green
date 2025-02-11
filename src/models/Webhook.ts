import mongoose, { Document, Schema } from "mongoose";

// Interface for Webhook document
export interface IWebhook extends Document {
    userId: mongoose.Types.ObjectId;
    eventType: string;
    data: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

// Schema for webhook data
const webhookSchema = new Schema<IWebhook>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        eventType: {
            type: String,
            required: true,
            index: true,
        },
        data: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    { timestamps: true }
);

// Create indexes for efficient querying
webhookSchema.index({ createdAt: -1 });
webhookSchema.index({ userId: 1, eventType: 1 });

const Webhook =
    mongoose.models.Webhook ||
    mongoose.model<IWebhook>("Webhook", webhookSchema);

export default Webhook;
