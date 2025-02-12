import mongoose, { Document, Schema } from "mongoose";

export interface ISecret extends Document {
    userId: string;
    name: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

const secretSchema = new Schema<ISecret>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            index: true,
        },
        value: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Secret =
    mongoose.models.Secret || mongoose.model<ISecret>("Secret", secretSchema);

export default Secret;
