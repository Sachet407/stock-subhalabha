import dbConnect from "@/lib/dbConnect";
import YarnModel from "@/model/Yarn";
import { recalculateFromDate } from "@/lib/yarnRecalculate";

const cleanNumber = (num: number) =>
    Number.parseFloat(num.toPrecision(12));

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {
            date,
            opening_Balance,
            purchase = 0,
            consumption = 0,
            wastage = 0,
        } = await request.json();

        // 1️⃣ Find the latest previous entry by BS date
        const previous = await YarnModel.findOne({
            date: { $lt: date }
        }).sort({ date: -1 });

        let finalOpeningBalance: number;

        if (!previous) {
            // First-ever entry
            if (opening_Balance === undefined || opening_Balance === null) {
                return Response.json(
                    {
                        success: false,
                        message: "Opening balance is required for the first entry."
                    },
                    { status: 400 }
                );
            }
            finalOpeningBalance = cleanNumber(opening_Balance);
        } else {
            // Auto-carry forward from previous day
            finalOpeningBalance = cleanNumber(previous.balance);
        }

        // 2️⃣ Calculations
        const total = cleanNumber(finalOpeningBalance + purchase);
        const balance = cleanNumber(total - consumption - wastage);

        if (balance < 0) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Balance cannot be negative. Please check consumption and wastage."
                },
                { status: 400 }
            );
        }

        // 3️⃣ Create entry
        const yarn = await YarnModel.create({
            date,
            opening_Balance: finalOpeningBalance,
            purchase: cleanNumber(purchase),
            total,
            consumption: cleanNumber(consumption),
            wastage: cleanNumber(wastage),
            balance,
        });
        await recalculateFromDate(date);
        return Response.json(
            { success: true, data: yarn },
            { status: 201 }
        );

    } catch (error) {
        console.error("Yarn create error:", error);
        return Response.json(
            { success: false, message: "Failed to create yarn entry" },
            { status: 500 }
        );
    }
}

export async function GET() {
    await dbConnect();

    try {
        const yarns = await YarnModel.find()
            .sort({ date: -1 })
            .exec();

        return Response.json(
            { success: true, data: yarns },
            { status: 200 }
        );
    } catch (error) {
        console.error("Yarn fetch error:", error);
        return Response.json(
            { success: false, message: "Failed to fetch yarn data" },
            { status: 500 }
        );
    }
}