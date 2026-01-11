import dbConnect from "@/lib/dbConnect";
import YarnModel from "@/model/Yarn";

const cleanNumber = (num: number) =>
    Number.parseFloat(num.toPrecision(12));

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {
            date,
            opening_Balance,
            purchase,
            consumption,
            wastage,
        } = await request.json();

        // ✅ Natural math + precision cleaning
        const total = cleanNumber(opening_Balance + purchase);
        const balance = cleanNumber(total - consumption - wastage);

        if (balance < 0) {
            return Response.json(
                { success: false, message: "Balance cannot be negative. Please check consumption and wastage." },
                { status: 400 }
            );
        }

        const yarn = await YarnModel.create({
            date,
            opening_Balance: cleanNumber(opening_Balance),
            purchase: cleanNumber(purchase),
            total,
            consumption: cleanNumber(consumption),
            wastage: cleanNumber(wastage),
            balance,
        });

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
            .sort({ createdAt: -1 })
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