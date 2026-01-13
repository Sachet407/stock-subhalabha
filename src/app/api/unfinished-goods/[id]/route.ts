import dbConnect from "@/lib/dbConnect";
import UnfinishedGoodsModel from "@/model/UnfinishedGoods";
import { NextRequest } from "next/server";

const cleanNumber = (num: number) =>
  Number.parseFloat(num.toPrecision(12));

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id } = await context.params;

    const {
      date,
      opening_Balance,
      received,
      finished_meter,
      finished_kg,
    } = await request.json();

    const total = cleanNumber(opening_Balance + received);
    const balance = cleanNumber(total - finished_kg);

    const updated = await UnfinishedGoodsModel.findByIdAndUpdate(
      id,
      {
        date,
        opening_Balance: cleanNumber(opening_Balance),
        received: cleanNumber(received),
        total,
        finished_meter: cleanNumber(finished_meter),
        finished_kg: cleanNumber(finished_kg),
        balance,
      },
      { new: true }
    ).exec();

    if (!updated) {
      return Response.json(
        { success: false, message: "Entry not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("UnfinishedGoods update error:", error);
    return Response.json(
      { success: false, message: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id } = await context.params;

    const deleted = await UnfinishedGoodsModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      return Response.json(
        { success: false, message: "Entry not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("UnfinishedGoods delete error:", error);
    return Response.json(
      { success: false, message: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
