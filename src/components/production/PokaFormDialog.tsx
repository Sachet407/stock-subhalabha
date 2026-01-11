"use client"

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NepaliDatePicker } from "@/components/NepaliDatePicker";
import { getTodayBSDate } from "date-picker-np"
import { createPokas, fetchLatestBalance } from "@/lib/poka";
import { cn, cleanNumber } from "@/lib/utils";

const pokaItemSchema = z.object({
    poka_no: z.string().min(1, "Poka No is required"),
    shade_no: z.string().min(1, "Shade No is required"),
    meter: z.number().min(0.01, "Meter must be > 0"),
    kg: z.number().min(0.01, "Kg must be > 0"),
});

type PokaItem = z.infer<typeof pokaItemSchema>;

interface PokaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function PokaFormDialog({ open, onOpenChange, onSuccess }: PokaFormDialogProps) {
    const [addedPokas, setAddedPokas] = useState<PokaItem[]>([]);
    const [balance, setBalance] = useState<{ meter: number; kg: number }>({ meter: 0, kg: 0 });
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(getTodayBSDate());

    const form = useForm<PokaItem>({
        resolver: zodResolver(pokaItemSchema),
        defaultValues: {
            poka_no: "",
            shade_no: "",
            meter: undefined,
            kg: undefined,
        },
    });

    useEffect(() => {
        if (open) {
            loadBalance();
            setAddedPokas([]);
            form.reset();
        }
    }, [open]);

    const loadBalance = async () => {
        const data = await fetchLatestBalance();
        setBalance(data);
    };

    const handleAddPoka = (values: PokaItem) => {
        // Check if enough balance
        const totalMeter = cleanNumber(addedPokas.reduce((sum, p) => sum + p.meter, 0) + values.meter);
        const totalKg = cleanNumber(addedPokas.reduce((sum, p) => sum + p.kg, 0) + values.kg);

        if (totalMeter > balance.meter || totalKg > balance.kg) {
            alert("Insufficient balance in unfinished goods!");
            return;
        }

        // Add prefix internally if not present (UI handles it separately)
        const newPoka = {
            ...values,
            poka_no: values.poka_no.startsWith("P-") ? values.poka_no : `P-${values.poka_no}`,
            shade_no: values.shade_no.startsWith("SH-") ? values.shade_no : `SH-${values.shade_no}`,
        };

        setAddedPokas([...addedPokas, newPoka]);
        form.reset({
            poka_no: "",
            shade_no: values.shade_no, // Keep shade no for convenience
            meter: undefined,
            kg: undefined,
        });
    };

    const handleRemovePoka = (index: number) => {
        setAddedPokas(addedPokas.filter((_, i) => i !== index));
    };

    const handleSaveAll = async () => {
        if (addedPokas.length === 0) return;
        setLoading(true);
        try {
            const res = await createPokas({ pokas: addedPokas, date });
            if (res.success) {
                onSuccess();
                onOpenChange(false);
            } else {
                alert(res.message || "Failed to save production");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const currentMeterRem = cleanNumber(balance.meter - addedPokas.reduce((sum, p) => sum + p.meter, 0));
    const currentKgRem = cleanNumber(balance.kg - addedPokas.reduce((sum, p) => sum + p.kg, 0));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Add Production Pokas</DialogTitle>
                    <p className="text-muted-foreground text-sm">Enter poka details with shade and quantity information.</p>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Date</label>
                        <NepaliDatePicker
                            value={date}
                            onChange={(val) => setDate(val || getTodayBSDate())}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">Current Balance</label>
                        <div className="h-[42px] flex items-center px-4 bg-primary/5 border border-primary/20 rounded-lg font-bold text-primary tabular-nums">
                            {cleanNumber(currentKgRem)} kg / {cleanNumber(currentMeterRem)} mtr
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-bold mb-4">Add Pokas</h3>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddPoka)} className="flex flex-wrap items-end gap-3">
                            <FormField
                                control={form.control}
                                name="poka_no"
                                render={({ field }) => (
                                    <FormItem className="flex-1 min-w-[120px]">
                                        <FormLabel>Poka No</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <span className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md font-medium text-sm">P-</span>
                                                <Input {...field} placeholder="001" className="rounded-l-none h-10" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="shade_no"
                                render={({ field }) => (
                                    <FormItem className="flex-1 min-w-[120px]">
                                        <FormLabel>Shade No</FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <span className="flex items-center px-2 bg-muted border border-r-0 rounded-l-md font-medium text-xs">SH-</span>
                                                <Input {...field} placeholder="01" className="rounded-l-none h-10" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="meter"
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormLabel>Meter</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                                className="h-10"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="kg"
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormLabel>Kg</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                                className="h-10"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 rounded-lg h-10 w-10">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </form>
                    </Form>
                </div>

                {addedPokas.length > 0 && (
                    <div className="mt-6 border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Poka No</th>
                                    <th className="px-4 py-2 text-left">Shade No</th>
                                    <th className="px-4 py-2 text-right">Meter</th>
                                    <th className="px-4 py-2 text-right">Kg</th>
                                    <th className="px-4 py-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {addedPokas.map((p, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2 font-medium text-primary">{p.poka_no}</td>
                                        <td className="px-4 py-2">
                                            <span className="bg-secondary px-2 py-0.5 rounded text-xs">{p.shade_no}</span>
                                        </td>
                                        <td className="px-4 py-2 text-right">{p.meter} m</td>
                                        <td className="px-4 py-2 text-right">{p.kg} kg</td>
                                        <td className="px-4 py-2 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemovePoka(i)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <DialogFooter className="mt-6 gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg h-11 px-6">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveAll}
                        disabled={addedPokas.length === 0 || loading}
                        className="bg-primary/80 hover:bg-primary text-white rounded-lg h-11 px-8 min-w-[180px]"
                    >
                        {loading ? "Saving..." : `Save Entry (${addedPokas.length} Pokas)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
