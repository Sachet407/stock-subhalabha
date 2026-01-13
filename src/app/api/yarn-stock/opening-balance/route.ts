import dbConnect from "@/lib/dbConnect";
import YarnModel from "@/model/Yarn";

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date");

        if (!date) {
            return Response.json(
                { success: false, message: "Date query param is required" },
                { status: 400 }
            );
        }

        const previous = await YarnModel.findOne({
            date: { $lt: date }
        }).sort({ date: -1 });

        return Response.json(
            {
                success: true,
                opening_Balance: previous ? previous.balance : null
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Opening balance fetch error:", error);
        return Response.json(
            { success: false, message: "Failed to fetch opening balance" },
            { status: 500 }
        );
    }
}
