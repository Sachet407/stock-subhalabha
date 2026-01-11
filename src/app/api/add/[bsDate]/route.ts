// app/api/add/[bsDate]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ProductionEntryModel from "@/model/ProductionModel";

// Use the exact type that Next.js expects
type NextRouteContext = {
  params: Promise<{ bsDate: string }>;
};

// 🔍 Search (GET) by bsDate
export async function GET(
  req: NextRequest,
  context: NextRouteContext
) {
  try {
    await dbConnect();
    const { bsDate } = await context.params;

    const entry = await ProductionEntryModel.findOne({ bsDate });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry, { status: 200 });
  } catch (error) {
    console.error("❌ GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entry" },
      { status: 500 }
    );
  }
}

// ✏️ Edit (PUT) by bsDate
export async function PUT(
  req: NextRequest,
  context: NextRouteContext
) {
  try {
    await dbConnect();
    const { bsDate } = await context.params;
    const body = await req.json();

    const updated = await ProductionEntryModel.findOneAndUpdate(
      { bsDate },
      body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("❌ PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

// 🗑️ Delete (DELETE) by bsDate
export async function DELETE(
  req: NextRequest,
  context: NextRouteContext
) {
  try {
    await dbConnect();
    const { bsDate } = await context.params;

    const deleted = await ProductionEntryModel.findOneAndDelete({ bsDate });

    if (!deleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}