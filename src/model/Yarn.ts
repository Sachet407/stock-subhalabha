import mongoose, { Schema, Document } from "mongoose";

export interface Yarn extends Document {
    date: string; // BS Date
    opening_Balance: number;
    purchase: number;
    total: number;
    consumption: number;
    wastage: number;
    balance: number;
}

const YarnSchema: Schema<Yarn> = new mongoose.Schema(
    {
        date: {
            type: String,
            required: [true, "Date (BS) is required"],
            trim: true,
        },
        opening_Balance: {
            type: Number,
            required: [true, "Opening balance is required"],
            min: 0,
        },
        purchase: {
            type: Number,
            required: [true, "Purchase is required"],
            min: 0,
        },
        total: {
            type: Number,
            required: [true, "Total is required"],
            min: 0,
        },
        consumption: {
            type: Number,
            required: [true, "Consumption is required"],
            min: 0,
        },
        wastage: {
            type: Number,
            required: [true, "Wastage is required"],
            min: 0,
        },
        balance: {
            type: Number,
            required: [true, "Balance is required"],
            min: 0,
        },
    },
    { timestamps: true }
);

const YarnModel =
    (mongoose.models.Yarn as mongoose.Model<Yarn>) ||
    mongoose.model<Yarn>("Yarn", YarnSchema);

export default YarnModel;
