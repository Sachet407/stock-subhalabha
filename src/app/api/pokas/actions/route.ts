import dbConnect from "@/lib/dbConnect";
import PokaModel from "@/model/Poka";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
    await dbConnect();
    try {
        const { action, pokaIds, date, targetLocation, customerName, salePrice } = await request.json();

        if (!pokaIds || !Array.isArray(pokaIds) || pokaIds.length === 0) {
            return NextResponse.json({ success: false, message: "No pokas selected" }, { status: 400 });
        }

        let updateQuery: any = {};

        if (action === 'sale') {
            updateQuery = {
                status: 'sold',
                sale_date: date,
                customer_name: customerName,
                sale_price: salePrice
            };
        } else if (action === 'transfer') {
            const firstPoka = await PokaModel.findById(pokaIds[0]);
            const sourceLocation = firstPoka?.location || 'biratnagar';

            updateQuery = {
                location: targetLocation || 'birgunj',
                transfer_date: date,
                transferred_from: sourceLocation,
                status: 'available'
            };
        } else {
            return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
        }

        const result = await PokaModel.updateMany(
            { _id: { $in: pokaIds } },
            { $set: updateQuery }
        );

        return NextResponse.json({
            success: true,
            message: `${action.charAt(0).toUpperCase() + action.slice(1)} successful`,
            count: result.modifiedCount
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Action failed" }, { status: 500 });
    }
}
