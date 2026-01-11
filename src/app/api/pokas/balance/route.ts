import dbConnect from "@/lib/dbConnect";
import UnfinishedGoodsModel from "@/model/UnfinishedGoods";
import { NextResponse } from "next/server";

export async function GET() {
    await dbConnect();
    try {
        const latestUG = await UnfinishedGoodsModel.findOne().sort({ createdAt: -1 });
        return NextResponse.json({
            success: true,
            data: {
                meter: latestUG?.finished_meter || 0,
                kg: latestUG?.finished_kg || 0
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch balance" }, { status: 500 });
    }
}
