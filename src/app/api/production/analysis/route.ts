// src/app/api/production/analysis/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ProductionEntryModel from '@/model/ProductionModel';
import { cleanNumber } from '@/lib/utils';
import { calculateDowntimeDuration } from '@/lib/production-utils';

/**
 * Expected query parameters:
 *   year: Nepali year (e.g., 2082)
 *   month: Nepali month number (1-12) – optional, if omitted aggregates whole year
 */
export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year) {
        return NextResponse.json({ error: 'year query param required' }, { status: 400 });
    }

    // Build a regex to match bsDate starting with the given year and optional month
    const yearPrefix = `${year}`;
    const monthPrefix = month ? `${year}-${String(month).padStart(2, '0')}` : yearPrefix;
    const dateRegex = new RegExp(`^${monthPrefix}`);

    const entries = await ProductionEntryModel.find({ bsDate: { $regex: dateRegex } }).lean();

    // Aggregate totals
    let totalProduction = 0;
    let totalDowntimeMinutes = 0;
    const machineStatsMap: Record<number, { production: number; downtimeMinutes: number }> = {};
    const reasonStatsMap: Record<string, number> = {};

    entries.forEach((entry) => {
        totalProduction = cleanNumber(totalProduction + entry.totalProduction);
        entry.machines.forEach((machine) => {
            const mNum = machine.machineNumber;
            if (!machineStatsMap[mNum]) {
                machineStatsMap[mNum] = { production: 0, downtimeMinutes: 0 };
            }
            const shifts = machine.isShiftCombined ? [machine.shiftData.combined] : [machine.shiftData.day, machine.shiftData.night];
            shifts.forEach((shift) => {
                if (shift) {
                    machineStatsMap[mNum].production = cleanNumber(machineStatsMap[mNum].production + shift.productionCount);
                    shift.downtimes.forEach((dt) => {
                        const duration = calculateDowntimeDuration(dt.from, dt.to);
                        const [hPart, mPart] = duration.split(' ');
                        const hours = parseInt(hPart.replace('h', ''), 10) || 0;
                        const minutes = parseInt(mPart.replace('m', ''), 10) || 0;
                        const mins = hours * 60 + minutes;
                        totalDowntimeMinutes = cleanNumber(totalDowntimeMinutes + mins);
                        machineStatsMap[mNum].downtimeMinutes = cleanNumber(machineStatsMap[mNum].downtimeMinutes + mins);
                        const reasonKey = dt.reason || 'Other';
                        reasonStatsMap[reasonKey] = (reasonStatsMap[reasonKey] || 0) + mins;
                    });
                }
            });
        });
    });

    // Build arrays
    const machineStats = Object.entries(machineStatsMap).map(([num, data]) => ({
        machineNumber: Number(num),
        production: cleanNumber(data.production),
        downtimeMinutes: cleanNumber(data.downtimeMinutes),
    }));
    const reasonStats = Object.entries(reasonStatsMap).map(([reason, minutes]) => ({
        reason,
        minutes: cleanNumber(minutes),
    }));

    // Ranking already computed earlier (we can reuse machineStats for ranking)
    const ranking = machineStats
        .sort((a, b) => b.downtimeMinutes - a.downtimeMinutes)
        .map((ms) => ({
            machine: `M${ms.machineNumber}`,
            downtimeHours: cleanNumber(ms.downtimeMinutes / 60),
            production: ms.production,
        }));

    return NextResponse.json({
        year,
        month: month || null,
        totalProduction: cleanNumber(totalProduction),
        totalDowntimeMinutes: cleanNumber(totalDowntimeMinutes),
        entryCount: entries.length,
        ranking,
        machineStats,
        reasonStats,
    });

}
