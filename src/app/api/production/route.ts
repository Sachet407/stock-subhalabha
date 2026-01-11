// src/app/api/production/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ProductionEntryModel from '@/model/ProductionModel';
import { cleanNumber } from '@/lib/utils';

export async function GET() {
    await dbConnect();
    const entries = await ProductionEntryModel.find().sort({ bsDate: -1 }).lean();
    return NextResponse.json(entries);
}

export async function POST(request: Request) {
    await dbConnect();
    const data = await request.json();
    // Calculate total production using cleanNumber to avoid floating noise
    let total = 0;
    data.machines?.forEach((m: any) => {
        if (m.isShiftCombined && m.shiftData?.combined) {
            total += cleanNumber(m.shiftData.combined.productionCount);
        } else {
            if (m.shiftData?.day) total += cleanNumber(m.shiftData.day.productionCount);
            if (m.shiftData?.night) total += cleanNumber(m.shiftData.night.productionCount);
        }
    });
    const entry = new ProductionEntryModel({
        bsDate: data.bsDate,
        machines: data.machines,
        totalProduction: cleanNumber(total),
    });
    await entry.save();
    return NextResponse.json(entry);
}
