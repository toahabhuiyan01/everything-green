import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { withAuth } from "@/lib/authMiddleware";

// Schema for user input validation
const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

// GET /api/users - Fetch all users
export const GET = withAuth(getUser);
// POST /api/users - Create a new user
export const POST = userCreate;

async function getUser() {
    try {
        await connectDB();
        const users = await User.find({}, { password: 0 });
        return NextResponse.json(users);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

async function userCreate(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const validatedData = userSchema.parse(body);

        const existingUser = await User.findByEmail(validatedData.email);
        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        const user = await User.create(validatedData);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user.toObject();
        return NextResponse.json(
            { user: userWithoutPassword, message: "User created successfully" },
            { status: 201 }
        );
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
