"use client"

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NepaliDatePicker } from "@/components/NepaliDatePicker";
import { getTodayBSDate } from "date-picker-np"
import { createUnfinishedGoods, updateUnfinishedGoods } from "@/lib/unfinishedGoods";
import { UnfinishedGoods } from "@/lib/unfinishedGoods";
import { AlertCircle } from "lucide-react";

// Preprocessor to handle blank numbers as undefined
const numericSchema = z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0, { message: "Value must be >= 0" })
);

const formSchema = z.object({
    date: z.string().min(1, { message: "Date is required" }),
    opening_Balance: numericSchema,
    received: numericSchema.optional().default(0),
    finished_meter: numericSchema.optional().default(0),
    finished_kg: numericSchema.optional().default(0),
});

type FormValues = z.infer<typeof formSchema>;


interface FormDialogProps {
    initialData?: UnfinishedGoods;
    latestBalance?: number;
    onSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UnfinishedGoodsFormDialog({ initialData, latestBalance, onSuccess, open, onOpenChange }: FormDialogProps) {
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
    const todayDate = getTodayBSDate();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: todayDate,
            opening_Balance: latestBalance ?? undefined,
            received: undefined,
            finished_meter: undefined,
            finished_kg: undefined,
        },
    });


    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    date: initialData.date,
                    opening_Balance: initialData.opening_Balance,
                    received: initialData.received,
                    finished_meter: initialData.finished_meter,
                    finished_kg: initialData.finished_kg,
                });
            } else {
                form.reset({
                    date: todayDate,
                    opening_Balance: latestBalance,
                    received: undefined,
                    finished_meter: undefined,
                    finished_kg: undefined,
                });

            }
        }
    }, [initialData, latestBalance, form, open, todayDate]);

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            const ob = values.opening_Balance ?? 0;
            const rec = values.received ?? 0;
            const fm = values.finished_meter ?? 0;
            const fk = values.finished_kg ?? 0;

            const total = ob + rec;
            const balance = total - fk;

            if (balance < 0) {
                setErrorModal({
                    open: true,
                    message: `Invalid Entry: Balance would become negative (${balance}). Total stock (${total}) is less than Finished Kg (${fk}).`
                });
                return;
            }

            const payload = {
                date: values.date,
                opening_Balance: ob,
                received: rec,
                finished_meter: fm,
                finished_kg: fk,
            };

            if (initialData) {
                await updateUnfinishedGoods(initialData._id, payload as any);
            } else {
                await createUnfinishedGoods(payload as any);
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            setErrorModal({ open: true, message: error.message || "An unexpected error occurred." });
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>{initialData ? "Edit Unfinished Goods Entry" : "Add New Unfinished Goods Entry"}</DialogTitle>
                    </DialogHeader>
                    <Form {...(form as any)}>
                        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-4">
                            <FormField
                                control={form.control as any}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date (BS)</FormLabel>
                                        <FormControl>
                                            <NepaliDatePicker
                                                value={field.value as any}
                                                onChange={(date) => field.onChange(date || "")}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="opening_Balance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Opening Balance</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Enter opening balance"
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                    disabled={!!initialData || (latestBalance !== undefined && !initialData)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="received"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Received</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Enter received quantity"
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="finished_meter"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Finished (Meter)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Enter finished meters"
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="finished_kg"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Finished (Kg)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Enter finished kg"
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full">
                                    {initialData ? "Update Entry" : "Save Entry"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Error Modal */}
            <Dialog open={errorModal.open} onOpenChange={(o) => setErrorModal({ ...errorModal, open: o })}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <DialogTitle>Error</DialogTitle>
                        </div>
                        <DialogDescription className="text-foreground pt-2">
                            {errorModal.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setErrorModal({ ...errorModal, open: false })}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
