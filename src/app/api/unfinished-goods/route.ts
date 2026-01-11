import dbConnect from "@/lib/dbConnect";
import UnfinishedGoodsModel from "@/model/UnfinishedGoods";

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

    const total = cleanNumber(opening_Balance + received);
    const balance = cleanNumber(total - finished_kg);

    const entry = await UnfinishedGoodsModel.create({
      date,
      opening_Balance: cleanNumber(opening_Balance),
      received: cleanNumber(received),
      total,
      finished_meter: cleanNumber(finished_meter),
      finished_kg: cleanNumber(finished_kg),
      balance,
    });

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
      .sort({ createdAt: -1 })
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