import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Your BetterAuth instance

export async function PATCH(req) {
    const session = await auth.api.getSession({ headers: req.headers });
    
    // Strict Guard: Deny access if not an authenticated Admin
    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { userId, newRole } = await req.json();
    
    // Logic to look up userId in MongoDB and update role to newRole ("vendor" or "admin")
    // ...

    return NextResponse.json({ success: true, message: `User role updated to ${newRole}` });
}