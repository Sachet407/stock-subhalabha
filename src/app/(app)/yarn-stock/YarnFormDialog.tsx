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
import { createYarn, updateYarn } from "@/lib/fetchYarn";
import { Yarn } from "@/lib/fetchYarn";
import { AlertCircle } from "lucide-react";


// Custom preprocessor to handle blank strings as undefined for numeric fields
const numericSchema = z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0, { message: "Value must be >= 0" })
);
async function fetchOpeningBalance(date: string) {
    const res = await fetch(`/api/yarn-stock/opening-balance?date=${date}`);
    const data = await res.json();
    return data.opening_Balance;
}


const formSchema = z.object({
    date: z.string().min(1, { message: "Date is required" }),
    opening_Balance: numericSchema.optional(),
    purchase: numericSchema.optional().default(0),
    consumption: numericSchema.optional().default(0),
    wastage: numericSchema.optional().default(0),
});

type YarnFormValues = {
    date: string;
    opening_Balance: number | undefined;
    purchase: number | undefined;
    consumption: number | undefined;
    wastage: number | undefined;
};

interface YarnFormDialogProps {
    initialData?: Yarn;

    onSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function YarnFormDialog({ initialData, onSuccess, open, onOpenChange }: YarnFormDialogProps) {
    const [errorModal, setErrorModal] = useState<{ open: boolean, message: string }>({ open: false, message: "" });
    const todayDate = getTodayBSDate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAutoOpeningBalance, setIsAutoOpeningBalance] = useState(false);
    const form = useForm<YarnFormValues>({
        // @ts-ignore - zodResolver might complain about the optional fields mismatch but we handle it in onSubmit
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: todayDate,
            opening_Balance: undefined,
            purchase: undefined,
            consumption: undefined,
            wastage: undefined,
        },
    });



    const watchedDate = form.watch("date");

    useEffect(() => {
        if (!open) return;
        if (initialData) return; // editing mode
        if (!watchedDate) return;

        let cancelled = false;

        const loadOpeningBalance = async () => {
            try {
                const ob = await fetchOpeningBalance(watchedDate);
                console.log("Opening Balance", ob);
                if (!cancelled && typeof ob === "number") {
                    form.setValue("opening_Balance", ob, {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                    setIsAutoOpeningBalance(true); // 🔒 auto
                } else {
                    // 👇 no previous balance → allow manual entry
                    form.setValue("opening_Balance", undefined);
                    setIsAutoOpeningBalance(false); // ✍️ manual
                }
            } catch (err) {
                console.error("Failed to fetch opening balance", err);
            }
        };

        loadOpeningBalance();

        return () => {
            cancelled = true;
        };
    }, [watchedDate, open, initialData, form]);




    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    date: initialData.date,
                    opening_Balance: initialData.opening_Balance,
                    purchase: initialData.purchase,
                    consumption: initialData.consumption,
                    wastage: initialData.wastage,
                });
            } else {
                form.reset({
                    date: todayDate,
                    // opening_Balance: latestBalance,
                    purchase: undefined,
                    consumption: undefined,
                    wastage: undefined,
                });
            }
        }
    }, [initialData, form, open, todayDate]);



    const onSubmit: SubmitHandler<YarnFormValues> = async (values) => {
        if (isSubmitting) return;

        const { dirtyFields } = form.formState;

        const allManuallyEntered =
            dirtyFields.purchase &&
            dirtyFields.consumption &&
            dirtyFields.wastage;

        if (!allManuallyEntered) {
            setErrorModal({
                open: true,
                message:
                    "Please enter all the values.",
            });
            setIsSubmitting(false);
            return;
        }
        if (!initialData && values.opening_Balance === undefined) {
            setErrorModal({
                open: true,
                message:
                    "Opening Balance is required for this date because no previous stock was found."
            });
            setIsSubmitting(false);
            return;
        }
        try {
            setIsSubmitting(true);
            const ob = values.opening_Balance ?? 0;
            const pur = values.purchase ?? 0;
            const con = values.consumption ?? 0;
            const was = values.wastage ?? 0;

            const total = ob + pur;
            const balance = total - con - was;

            if (balance < 0) {
                setErrorModal({
                    open: true,
                    message: `Invalid Entry: Balance would become negative (${balance}). Total stock (${total}) is less than Consumption + Wastage (${con + was}).`
                });
                setIsSubmitting(false);
                return;
            }

            const payload = {
                date: values.date,
                opening_Balance: ob,
                purchase: pur,
                consumption: con,
                wastage: was,
            };

            if (initialData) {
                await updateYarn(initialData._id, payload as any);
            } else {
                await createYarn(payload as any);
            }
            onSuccess();
            setIsSubmitting(false);
            onOpenChange(false);
        } catch (error: any) {
            setErrorModal({ open: true, message: error.message || "An unexpected error occurred." });
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>{initialData ? "Edit Yarn Stock Entry" : "Add New Yarn Stock Entry"}</DialogTitle>
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
                                            <div className="w-full">
                                                <NepaliDatePicker
                                                    value={field.value as any}
                                                    onChange={(date) => field.onChange(date || "")}
                                                />
                                            </div>
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
                                                    value={field.value === undefined || field.value === null ? "" : field.value}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                    disabled={!!initialData || isAutoOpeningBalance}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="purchase"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Purchase</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Enter purchase"
                                                    value={field.value === undefined || field.value === null ? "" : field.value}
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
                                    name="consumption"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Consumption</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Enter consumption"
                                                    value={field.value === undefined || field.value === null ? "" : field.value}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="wastage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Wastage</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Enter wastage"
                                                    value={field.value === undefined || field.value === null ? "" : field.value}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? "Saving..."
                                        : initialData
                                            ? "Update Entry"
                                            : "Save Entry"}
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
