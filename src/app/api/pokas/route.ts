import dbConnect from "@/lib/dbConnect";
import PokaModel from "@/model/Poka";
import UnfinishedGoodsModel from "@/model/UnfinishedGoods";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get("location");
        const status = searchParams.get("status");
        const transferred_from = searchParams.get("transferred_from");

        const query: any = {};
        if (location) query.location = location;
        if (status) query.status = status;
        if (transferred_from) query.transferred_from = transferred_from;

        const pokas = await PokaModel.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: pokas });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch pokas" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const { pokas, date } = await request.json();

        if (!pokas || !Array.isArray(pokas) || pokas.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid pokas data" }, { status: 400 });
        }

        // 1. Check for duplicate Poka numbers first
        const pokaNos = pokas.map(p => p.poka_no);
        const duplicates = await PokaModel.find({ poka_no: { $in: pokaNos } });
        if (duplicates.length > 0) {
            return NextResponse.json({
                success: false,
                message: `Duplicate Poka number(s): ${duplicates.map(d => d.poka_no).join(", ")}`
            }, { status: 400 });
        }

        // 2. Insert Pokas
        const pokaEntries = pokas.map((p: any) => ({
            ...p,
            date,
            location: 'biratnagar',
            status: 'available'
        }));

        await PokaModel.insertMany(pokaEntries);

        // 3. Update Unfinished Goods balance
        const cleanNumber = (num: number) =>
            Number.parseFloat(num.toPrecision(12));

        const totalMeter = cleanNumber(pokas.reduce((acc: number, p: any) => acc + p.meter, 0));
        const totalKg = cleanNumber(pokas.reduce((acc: number, p: any) => acc + p.kg, 0));

        // Fetch latest UG entry
        const latestUG = await UnfinishedGoodsModel.findOne().sort({ createdAt: -1 });
        if (latestUG) {
            // Creation of Poka means goods are FINISHED, so ADD to finished_meter/kg
            latestUG.finished_meter = cleanNumber(Math.max(0, (latestUG.finished_meter || 0) + totalMeter));
            latestUG.finished_kg = cleanNumber(Math.max(0, (latestUG.finished_kg || 0) + totalKg));

            // Recalculate balance
            latestUG.balance = cleanNumber(latestUG.total - latestUG.finished_kg);
            await latestUG.save();
        }

        return NextResponse.json({ success: true, message: "Production saved successfully" }, { status: 201 });
    } catch (error: any) {
        console.error("Poka production error:", error);
        return NextResponse.json({ success: false, message: error.message || "Failed to save production" }, { status: 500 });
    }
}
