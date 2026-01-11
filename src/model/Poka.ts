import mongoose, { Schema, Document } from "mongoose";

export interface IPoka extends Document {
    date: string; // BS Date
    poka_no: string; // e.g. "P-001"
    shade_no: string; // e.g. "SH-01"
    meter: number;
    kg: number;
    location: 'biratnagar' | 'birgunj';
    status: 'available' | 'sold' | 'transferred';
    sale_date?: string;
    transfer_date?: string;
    received_date?: string;
    transferred_from?: string;
    sale_price?: number;
    customer_name?: string;
    remarks?: string;
}

const PokaSchema: Schema<IPoka> = new mongoose.Schema(
    {
        date: { type: String, required: true },
        poka_no: { type: String, required: true },
        shade_no: { type: String, required: true },
        meter: { type: Number, required: true, min: 0 },
        kg: { type: Number, required: true, min: 0 },
        location: {
            type: String,
            enum: ['biratnagar', 'birgunj'],
            default: 'biratnagar'
        },
        status: {
            type: String,
            enum: ['available', 'sold', 'transferred'],
            default: 'available'
        },
        sale_date: { type: String },
        transfer_date: { type: String },
        received_date: { type: String },
        transferred_from: { type: String },
        sale_price: { type: Number },
        customer_name: { type: String },
        remarks: { type: String },
    },
    { timestamps: true }
);

// Create index for faster querying
PokaSchema.index({ location: 1, status: 1 });
PokaSchema.index({ poka_no: 1 }, { unique: true });

const PokaModel = mongoose.models.Poka || mongoose.model<IPoka>("Poka", PokaSchema);

export default PokaModel;
