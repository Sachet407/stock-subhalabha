import dbConnect from "@/lib/dbConnect";
import YarnModel from "@/model/Yarn";

const cleanNumber = (num: number) =>
    Number.parseFloat(num.toPrecision(12));

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const {
            date,
            opening_Balance,
            purchase,
            consumption,
            wastage,
        } = await request.json();

        const total = cleanNumber(opening_Balance + purchase);
        const balance = cleanNumber(total - consumption - wastage);

        if (balance < 0) {
            return Response.json(
                { success: false, message: "Balance cannot be negative. Please check consumption and wastage." },
                { status: 400 }
            );
        }

        const updatedYarn = await YarnModel.findByIdAndUpdate(
            id,
            {
                date,
                opening_Balance: cleanNumber(opening_Balance),
                purchase: cleanNumber(purchase),
                total,
                consumption: cleanNumber(consumption),
                wastage: cleanNumber(wastage),
                balance,
            },
            { new: true }
        ).exec();

        if (!updatedYarn) {
            return Response.json(
                { success: false, message: "Yarn not found" },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, data: updatedYarn },
            { status: 200 }
        );
    } catch (error) {
        console.error("Yarn update error:", error);
        return Response.json(
            { success: false, message: "Failed to update yarn" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    try {
        const deletedYarn = await YarnModel.findByIdAndDelete(id).exec();

        if (!deletedYarn) {
            return Response.json(
                { success: false, message: "Yarn not found" },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, message: "Yarn deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Yarn delete error:", error);
        return Response.json(
            { success: false, message: "Failed to delete yarn" },
            { status: 500 }
        );
    }
}
