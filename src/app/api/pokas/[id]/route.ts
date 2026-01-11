import dbConnect from "@/lib/dbConnect";
import PokaModel from "@/model/Poka";
import UnfinishedGoodsModel from "@/model/UnfinishedGoods";
import { NextRequest, NextResponse } from "next/server";

const cleanNumber = (num: number) =>
    Number.parseFloat(num.toPrecision(12));

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();
        const { poka_no, shade_no, meter, kg, status: newStatus, location: newLocation } = body;

        const oldPoka = await PokaModel.findById(id);
        if (!oldPoka) {
            return NextResponse.json({ success: false, message: "Poka not found" }, { status: 404 });
        }

        // Calculate differences for UG balance (production totals)
        const meterDiff = (meter || oldPoka.meter) - oldPoka.meter;
        const kgDiff = (kg || oldPoka.kg) - oldPoka.kg;

        // Update basic fields
        if (poka_no) oldPoka.poka_no = poka_no;
        if (shade_no) oldPoka.shade_no = shade_no;
        if (meter !== undefined) oldPoka.meter = meter;
        if (kg !== undefined) oldPoka.kg = kg;

        // Handle Status & Location Transitions
        if (newStatus) oldPoka.status = newStatus;
        if (newLocation) oldPoka.location = newLocation;

        // Logic resets based on final state
        if (oldPoka.status === 'available') {
            oldPoka.sale_date = undefined;
            if (oldPoka.location === 'biratnagar') {
                oldPoka.transfer_date = undefined;
                oldPoka.transferred_from = undefined;
            } else if (oldPoka.location === 'birgunj') {
                oldPoka.transferred_from = 'biratnagar'; // Always from BN for now
                if (!oldPoka.transfer_date) {
                    const { getTodayBSDate } = await import("date-picker-np");
                    oldPoka.transfer_date = getTodayBSDate();
                }
            }
        } else if (oldPoka.status === 'sold') {
            if (!oldPoka.sale_date) {
                const { getTodayBSDate } = await import("date-picker-np");
                oldPoka.sale_date = getTodayBSDate();
            }
        }

        await oldPoka.save();

        // Update Unfinished Goods balance (production totals)
        if (meterDiff !== 0 || kgDiff !== 0) {
            const latestUG = await UnfinishedGoodsModel.findOne().sort({ createdAt: -1 });
            if (latestUG) {
                // When Poka weight increases (positive diff), we have FINISHED more goods, 
                // so finished_meter/kg should INCREASE (adding the diff).
                latestUG.finished_meter = cleanNumber(Math.max(0, (latestUG.finished_meter || 0) + meterDiff));
                latestUG.finished_kg = cleanNumber(Math.max(0, (latestUG.finished_kg || 0) + kgDiff));

                // Recalculate balance
                latestUG.balance = cleanNumber(latestUG.total - latestUG.finished_kg);
                await latestUG.save();
            }
        }

        return NextResponse.json({ success: true, message: "Poka updated successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Failed to update poka" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const poka = await PokaModel.findById(id);
        if (!poka) {
            return NextResponse.json({ success: false, message: "Poka not found" }, { status: 404 });
        }

        const meter = poka.meter;
        const kg = poka.kg;
        const status = poka.status;

        await PokaModel.findByIdAndDelete(id);

        // Return materials to Unfinished Goods (reduce production totals)
        const latestUG = await UnfinishedGoodsModel.findOne().sort({ createdAt: -1 });
        if (latestUG) {
            // Deleting a Poka means we "un-finish" those goods, so subtract from finished totals.
            latestUG.finished_meter = cleanNumber(Math.max(0, (latestUG.finished_meter || 0) - meter));
            latestUG.finished_kg = cleanNumber(Math.max(0, (latestUG.finished_kg || 0) - kg));

            // Recalculate balance
            latestUG.balance = cleanNumber(latestUG.total - latestUG.finished_kg);
            await latestUG.save();
        }

        return NextResponse.json({ success: true, message: "Poka deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Failed to delete poka" }, { status: 500 });
    }
}
