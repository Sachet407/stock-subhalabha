import dbConnect from "@/lib/dbConnect";
import UnfinishedGoodsModel from "@/model/UnfinishedGoods";
import { recalculateFromDateUnfinished } from "@/lib/unfinishedRecalculate";
const cleanNumber = (num: number) =>
  Number.parseFloat(num.toPrecision(12));

export async function POST(request: Request) {
  await dbConnect();

  try {
    const {
      date,
      opening_Balance,
      received,
      finished_meter,
      finished_kg,
    } = await request.json();

    const existing = await UnfinishedGoodsModel.findOne({ date });
    if (existing) {
      return Response.json(
        {
          success: false,
          message: `Entry for ${date} already exists.`,
        },
        { status: 409 }
      );
    }
    const previous = await UnfinishedGoodsModel.findOne({
      date: { $lt: date },
    }).sort({ date: -1 });

    let finalOpeningBalance: number;

    if (!previous) {
      // First-ever entry → opening balance required
      if (opening_Balance === undefined || opening_Balance === null) {
        return Response.json(
          {
            success: false,
            message:
              "Opening balance is required for the first Unfinished Goods entry.",
          },
          { status: 400 }
        );
      }
      finalOpeningBalance = cleanNumber(opening_Balance);
    } else {
      // Auto carry-forward
      finalOpeningBalance = cleanNumber(previous.balance);
    }
    const total = cleanNumber(finalOpeningBalance + received);
    const balance = cleanNumber(total - finished_kg);

    const entry = await UnfinishedGoodsModel.create({
      date,
      opening_Balance: cleanNumber(finalOpeningBalance),
      received: cleanNumber(received),
      total,
      finished_meter: cleanNumber(finished_meter),
      finished_kg: cleanNumber(finished_kg),
      balance,
    });
    await recalculateFromDateUnfinished(date);
    return Response.json(
      { success: true, data: entry },
      { status: 201 }
    );
  } catch (error) {
    console.error("UnfinishedGoods create error:", error);
    return Response.json(
      { success: false, message: "Failed to create entry" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();

  try {
    const entries = await UnfinishedGoodsModel.find()
      .sort({ date: -1 })
      .exec();

    return Response.json(
      { success: true, data: entries },
      { status: 200 }
    );
  } catch (error) {
    console.error("UnfinishedGoods fetch error:", error);
    return Response.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}