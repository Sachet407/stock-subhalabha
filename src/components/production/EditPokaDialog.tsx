"use client"

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updatePoka, Poka } from "@/lib/poka";

const editPokaSchema = z.object({
    poka_no: z.string().min(1, "Poka No is required"),
    shade_no: z.string().min(1, "Shade No is required"),
    meter: z.number().min(0.01, "Meter must be > 0"),
    kg: z.number().min(0.01, "Kg must be > 0"),
    state: z.string(), // combined status + location
});

type EditPokaValues = {
    poka_no: string;
    shade_no: string;
    meter: number;
    kg: number;
    state: string;
};

interface EditPokaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    poka: Poka | null;
    onSuccess: () => void;
    pageContext: 'biratnagar' | 'birgunj';
}

export function EditPokaDialog({ open, onOpenChange, poka, onSuccess, pageContext }: EditPokaDialogProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<EditPokaValues>({
        resolver: zodResolver(editPokaSchema),
        defaultValues: {
            poka_no: "",
            shade_no: "",
            meter: 0,
            kg: 0,
            state: "biratnagar_available",
        },
    });

    const isBiratnagarInventory = poka?.location === 'biratnagar' && poka?.status === 'available';

    useEffect(() => {
        if (open && poka) {
            form.reset({
                poka_no: poka.poka_no,
                shade_no: poka.shade_no,
                meter: poka.meter,
                kg: poka.kg,
                state: poka.status === 'sold' ? 'sold' : `${poka.location}_${poka.status}`,
            });
        }
    }, [open, poka]);

    const onSubmit = async (values: EditPokaValues) => {
        if (!poka) return;
        setLoading(true);
        try {
            // Map state back to status and location
            let status = "available";
            let location = poka.location;

            if (values.state === "sold") {
                status = "sold";
            } else if (values.state === "biratnagar_available") {
                status = "available";
                location = "biratnagar";
            } else if (values.state === "birgunj_available") {
                status = "available";
                location = "birgunj";
            }

            const res = await updatePoka(poka._id, {
                ...values,
                status: status as any,
                location: location as any
            });
            if (res.success) {
                onSuccess();
                onOpenChange(false);
            } else {
                alert(res.message || "Failed to update poka");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Poka Entry</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="poka_no"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Poka No</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={!isBiratnagarInventory} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shade_no"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shade No</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={!isBiratnagarInventory} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="meter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meter</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={!isBiratnagarInventory}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
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
                                    <FormItem>
                                        <FormLabel>Kg</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={!isBiratnagarInventory}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {!isBiratnagarInventory && (
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location / Status / Correction</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select state" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* In Biratnagar history tabs, show 3 options */}
                                                {pageContext === 'biratnagar' ? (
                                                    <>
                                                        <SelectItem value="biratnagar_available">Inventory (Biratnagar)</SelectItem>
                                                        <SelectItem value="sold">Sales</SelectItem>
                                                        <SelectItem value="birgunj_available">Transferred</SelectItem>
                                                    </>
                                                ) : (
                                                    /* In Birgunj, show only 2 options as requested */
                                                    <>
                                                        <SelectItem value="birgunj_available">Inventory (Birgunj)</SelectItem>
                                                        <SelectItem value="sold">Sales</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            You can move items between locations or undo sales here.
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Updating..." : "Update Poka"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
