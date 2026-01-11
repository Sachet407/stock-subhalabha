import { Schema, model, models, Document } from 'mongoose';

interface Downtime {
  from: string; // E.g., "14:00"
  to: string;   // E.g., "15:00"
  reason: string;
}

interface ShiftDetail {
  operatorName: string;
  productionCount: number; // In KG, e.g., 1.75
  downtimes: Downtime[];
}

interface MachineEntry {
  machineNumber: number; // 1 to 10
  isShiftCombined: boolean;
  shiftData: {
    combined?: ShiftDetail;
    day?: ShiftDetail;
    night?: ShiftDetail;
  };
}

export interface ProductionEntry extends Document {
  bsDate: string; // Nepali date as string, e.g., "2081-04-12"
  machines: MachineEntry[];
  totalProduction: number; // Sum of all production in KG
}

const DowntimeSchema = new Schema<Downtime>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  reason: { type: String, required: true },
}, { _id: false });

const ShiftDetailSchema = new Schema<ShiftDetail>({
  operatorName: { type: String, required: true },
  productionCount: { type: Number, required: true },
  downtimes: { type: [DowntimeSchema], default: [] },
}, { _id: false });

const MachineEntrySchema = new Schema<MachineEntry>({
  machineNumber: { type: Number, required: true },
  isShiftCombined: { type: Boolean, required: true },
  shiftData: {
    combined: { type: ShiftDetailSchema, required: false },
    day: { type: ShiftDetailSchema, required: false },
    night: { type: ShiftDetailSchema, required: false },
  },
}, { _id: false });

const ProductionEntrySchema = new Schema<ProductionEntry>({
  bsDate: { type: String, required: true },
  machines: { type: [MachineEntrySchema], required: true },
  totalProduction: { type: Number, required: true, default: 0 },
}, { timestamps: true });

// ✅ Fix: prevent model overwrite in development or multiple imports
const ProductionEntryModel = models.ProductionEntry || model<ProductionEntry>('ProductionEntry', ProductionEntrySchema);

export default ProductionEntryModel;
