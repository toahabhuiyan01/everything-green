import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "../../../../middleware";

// Schema for login input validation
const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

// POST /api/auth/login - User login
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        // Validate input
        const validatedData = loginSchema.parse(body);

        // Find user by email
        const user = await User.findByEmail(validatedData.email);
        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(
            validatedData.password
        );
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const token = generateToken({
            userId: user._id!.toString(),
            email: user.email,
        });

        // Return user data without password and the token
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user.toObject();
        return NextResponse.json({
            user: userWithoutPassword,
            token,
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
