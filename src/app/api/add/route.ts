
import dbConnect from '@/lib/dbConnect';
import ProductionEntryModel from '@/model/ProductionModel';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "all" | "last7" | "monthly" | "yearly"
    const value = searchParams.get("value");   // e.g. "2082-04" or "2082"

    let query = {};
    let limit = 0;

    // 🟢 Handle filters
    if (filter === "last7") {
      // instead of date range → get latest 7 entries
      limit = 7;
    } else if (filter === "monthly" && value) {
      query = { bsDate: { $regex: `^${value}` } }; // match "2082-04"
    } else if (filter === "yearly" && value) {
      query = { bsDate: { $regex: `^${value}` } }; // match "2082"
    } else if (filter === "all" || !filter) {
      query = {}; // return all
    }

    // 🔍 Fetch data
    const queryExec = ProductionEntryModel.find(query).sort({ createdAt: -1 });
    if (limit > 0) queryExec.limit(limit);

    const data = await queryExec;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get production error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new production entry
export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { bsDate, machines, totalProduction } = body;

    // Basic validation
    if (!bsDate || !machines || !Array.isArray(machines)) {
      return Response.json(
        { success: false, message: 'bsDate and machines array are required.' },
        { status: 400 }
      );
    }

    // Validate machines array
    for (const machine of machines) {
      if (!machine.machineNumber || typeof machine.isShiftCombined !== 'boolean') {
        return Response.json(
          { success: false, message: 'Each machine must have machineNumber and isShiftCombined.' },
          { status: 400 }
        );
      }

      // Validate shift data based on isShiftCombined
      if (machine.isShiftCombined) {
        if (!machine.shiftData?.combined) {
          return Response.json(
            { success: false, message: 'Combined shift data is required when isShiftCombined is true.' },
            { status: 400 }
          );
        }
      } else {
        if (!machine.shiftData?.day && !machine.shiftData?.night) {
          return Response.json(
            { success: false, message: 'Day or night shift data is required when isShiftCombined is false.' },
            { status: 400 }
          );
        }
      }

      // Validate shift details
      const shifts = [machine.shiftData?.combined, machine.shiftData?.day, machine.shiftData?.night].filter(Boolean);
      for (const shift of shifts) {
        if (typeof shift.operatorName !== 'string' || typeof shift.productionCount !== 'number') {
          return Response.json(
            { success: false, message: 'Each shift must have operatorName and productionCount.' },
            { status: 400 }
          );
        }

        // Validate downtimes
        if (shift.downtimes) {
          for (const downtime of shift.downtimes) {
            if (!downtime.from || !downtime.to || !downtime.reason) {
              return Response.json(
                { success: false, message: 'Each downtime must have from, to, and reason.' },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // Check for existing entry with same date
    const existingEntry = await ProductionEntryModel.findOne({ bsDate });
    if (existingEntry) {
      return Response.json(
        { success: false, message: 'Production entry for this date already exists.' },
        { status: 400 }
      );
    }


    const newProductionEntry = new ProductionEntryModel
      ({
        bsDate,
        machines,
        totalProduction
      });

    await newProductionEntry.save();

    return Response.json(
      {
        success: true,
        message: 'Production entry created successfully.',
        data: newProductionEntry
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating production entry:', error);
    return Response.json(
      { success: false, message: 'Error creating production entry.' },
      { status: 500 }
    );
  }
}