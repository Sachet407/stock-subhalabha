import mongoose, { Schema, Document } from "mongoose";

export interface UnfinishedGoods extends Document {
    date: string; // BS Date
    opening_Balance: number;
    received: number;
    total: number;
    finished_meter: number;
    finished_kg: number;
    balance: number;
}

const UnfinishedGoodsSchema: Schema<UnfinishedGoods> = new mongoose.Schema(
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
        received: {
            type: Number,
            required: [true, "Received quantity is required"],
            min: 0,
        },
        total: {
            type: Number,
            required: [true, "Total is required"],
            min: 0,
        },
        finished_meter: {
            type: Number,
            required: [true, "Finished (meter) is required"],
            min: 0,
        },
        finished_kg: {
            type: Number,
            required: [true, "Finished (kg) is required"],
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

const UnfinishedGoodsModel =
    (mongoose.models.UnfinishedGoods as mongoose.Model<UnfinishedGoods>) ||
    mongoose.model<UnfinishedGoods>("UnfinishedGoods", UnfinishedGoodsSchema);

export default UnfinishedGoodsModel;
