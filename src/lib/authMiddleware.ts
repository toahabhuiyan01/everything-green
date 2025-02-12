import { NextRequest, NextResponse } from "next/server";
import { verifyAuthHeader } from "./auth";

export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (req: NextRequest) {
        const { isValid, payload, error } = verifyAuthHeader(
            req.headers.get("Authorization")
        );

        if (!isValid) {
            return NextResponse.json(
                { message: `Unauthorized - ${error}` },
                { status: 401 }
            );
        }

        // Add user information to request headers
        req.headers.set("x-user-id", payload!.userId);
        req.headers.set("x-user-email", payload!.email);

        return handler(req);
    };
}
