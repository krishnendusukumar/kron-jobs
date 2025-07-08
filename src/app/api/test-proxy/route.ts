import { NextResponse } from "next/server";
import { testProxyConnection } from "@/lib/linkedin-scraper";

export async function GET() {
    try {
        console.log("Testing proxy connection...");

        const proxyWorks = await testProxyConnection();

        if (proxyWorks) {
            return NextResponse.json({
                success: true,
                message: "Proxy connection successful"
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "Proxy connection failed"
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Proxy test error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
} 