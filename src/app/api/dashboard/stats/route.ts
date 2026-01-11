import dbConnect from "@/lib/dbConnect";
import PokaModel from "@/model/Poka";
import { NextResponse } from "next/server";
import { getTodayBSDate } from "date-picker-np";

export async function GET() {
    await dbConnect();
    try {
        const today = getTodayBSDate();

        const [
            bnInventory,
            bgInventory,
            todaySales,
            todayTransfers,
            recentActivity
        ] = await Promise.all([
            // Biratnagar Stock
            PokaModel.find({ location: 'biratnagar', status: 'available' }),
            // Birgunj Stock
            PokaModel.find({ location: 'birgunj', status: 'available' }),
            // Today's Sales (BN or BG)
            PokaModel.find({ status: 'sold', sale_date: today }),
            // Today's Transfers (Moved from BN to BG today)
            PokaModel.find({ status: 'available', location: 'birgunj', transfer_date: today }),
            // Recent Activity (Last 15 items either sold or transferred)
            PokaModel.find({
                $or: [
                    { status: 'sold' },
                    { status: 'available', location: 'birgunj' }
                ]
            }).sort({ updatedAt: -1 }).limit(15)
        ]);

        const stats = {
            biratnagar: {
                count: bnInventory.length,
                totalKg: Number(bnInventory.reduce((acc, p) => acc + (p.kg || 0), 0).toFixed(2))
            },
            birgunj: {
                count: bgInventory.length,
                totalKg: Number(bgInventory.reduce((acc, p) => acc + (p.kg || 0), 0).toFixed(2))
            },
            today: {
                salesKg: Number(todaySales.reduce((acc, p) => acc + (p.kg || 0), 0).toFixed(2)),
                transferredKg: Number(todayTransfers.reduce((acc, p) => acc + (p.kg || 0), 0).toFixed(2))
            },
            recentActivity: recentActivity.map(p => ({
                id: p._id,
                poka_no: p.poka_no,
                shade_no: p.shade_no,
                kg: p.kg,
                type: p.status === 'sold' ? 'Sale' : 'Transfer',
                location: p.location,
                date: p.status === 'sold' ? p.sale_date : p.transfer_date,
                updatedAt: p.updatedAt
            }))
        };

        return NextResponse.json({ success: true, data: stats });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
