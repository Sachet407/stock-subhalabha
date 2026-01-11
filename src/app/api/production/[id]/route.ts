// src/app/api/production/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ProductionEntryModel from '@/model/ProductionModel';
import { cleanNumber } from '@/lib/utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const entry = await ProductionEntryModel.findById(params.id).lean();
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(entry);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const data = await request.json();
    // Recalculate total production using cleanNumber
    let total = 0;
    data.machines?.forEach((m: any) => {
        if (m.isShiftCombined && m.shiftData?.combined) {
            total += cleanNumber(m.shiftData.combined.productionCount);
        } else {
            if (m.shiftData?.day) total += cleanNumber(m.shiftData.day.productionCount);
            if (m.shiftData?.night) total += cleanNumber(m.shiftData.night.productionCount);
        }
    });
    const updated = await ProductionEntryModel.findByIdAndUpdate(
        params.id,
        { bsDate: data.bsDate, machines: data.machines, totalProduction: cleanNumber(total) },
        { new: true }
    ).lean();
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const result = await ProductionEntryModel.findByIdAndDelete(params.id);
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
}
