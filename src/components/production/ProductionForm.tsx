"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { NepaliDatePicker } from "@/components/NepaliDatePicker";
import { Plus, Trash2, Clock, User, HardDrive, Calculator, Save } from "lucide-react";
import { cn, cleanNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const downtimeSchema = z.object({
    from: z.string().min(1, "Required"),
    to: z.string().min(1, "Required"),
    reason: z.string().min(1, "Required"),
});

const shiftDetailSchema = z.object({
    operatorName: z.string().min(1, "Required"),
    productionCount: z.coerce.number().min(0),
    downtimes: z.array(downtimeSchema),
});

const machineEntrySchema = z.object({
    machineNumber: z.number(),
    isShiftCombined: z.boolean(),
    shiftData: z.object({
        day: shiftDetailSchema.optional(),
        night: shiftDetailSchema.optional(),
        combined: shiftDetailSchema.optional(),
    }),
});

const formSchema = z.object({
    bsDate: z.string().min(1, "Date is required"),
    machines: z.array(machineEntrySchema),
    totalProduction: z.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductionFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export function ProductionForm({ initialData, onSubmit, isLoading }: ProductionFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            bsDate: "",
            machines: Array.from({ length: 10 }, (_, i) => ({
                machineNumber: i + 1,
                isShiftCombined: false,
                shiftData: {
                    day: { operatorName: "", productionCount: 0, downtimes: [] },
                    night: { operatorName: "", productionCount: 0, downtimes: [] },
                },
            })),
            totalProduction: 0,
        },
    });

    const [activeMachine, setActiveMachine] = useState(1);

    const { fields: machineFields } = useFieldArray({
        control: form.control,
        name: "machines",
    });

    // Calculate total production in real-time with cleanNumber to avoid floating noise
    const watchMachines = form.watch("machines");
    useEffect(() => {
        let total = 0;
        watchMachines.forEach((m) => {
            if (m.isShiftCombined) {
                total = cleanNumber(total + (m.shiftData.combined?.productionCount || 0));
            } else {
                total = cleanNumber(total + (m.shiftData.day?.productionCount || 0) + (m.shiftData.night?.productionCount || 0));
            }
        });
        form.setValue("totalProduction", total);
    }, [watchMachines, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="bsDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" /> Date (BS)
                                </FormLabel>
                                <FormControl>
                                    <NepaliDatePicker value={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Calculator className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Production</p>
                                        <h3 className="text-3xl font-bold text-primary">
                                            {form.watch("totalProduction").toFixed(2)} <span className="text-lg font-normal">KG</span>
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Machine Selection Tabs */}
                <div className="flex flex-wrap gap-2 pb-4 border-b">
                    {machineFields.map((field, index) => {
                        const machineNum = index + 1;
                        const isActive = activeMachine === machineNum;
                        // Check if machine has data (safer access)
                        const machineData = form.watch(`machines.${index}`);
                        const hasData = (machineData?.shiftData?.day?.productionCount || 0) > 0 ||
                            (machineData?.shiftData?.night?.productionCount || 0) > 0 ||
                            (machineData?.shiftData?.combined?.productionCount || 0) > 0;

                        return (
                            <div
                                key={field.id}
                                onClick={() => setActiveMachine(machineNum)}
                                className={cn(
                                    "cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                    isActive
                                        ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                                        : hasData
                                            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                            : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                                )}
                            >
                                M-{machineNum} {hasData && "*"}
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    {machineFields.map((field, index) => {
                        if (index + 1 !== activeMachine) return null;
                        return <MachineCard key={field.id} index={index} form={form} />;
                    })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveMachine(prev => Math.max(1, prev - 1))}
                        disabled={activeMachine === 1}
                    >
                        Previous Machine
                    </Button>

                    <div className="flex gap-2">
                        {activeMachine < 10 ? (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setActiveMachine(prev => Math.min(10, prev + 1))}
                            >
                                Next Machine
                            </Button>
                        ) : (
                            <Button type="submit" size="lg" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-green-900/20 shadow-lg">
                                {isLoading ? "Saving..." : "Save Report"}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Form>
    );
}

function MachineCard({ index, form }: { index: number; form: any }) {
    const isCombined = form.watch(`machines.${index}.isShiftCombined`);

    return (
        <Card className="overflow-hidden border-2 transition-all hover:border-primary/30">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <HardDrive className="w-5 h-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl">Machine #{index + 1}</CardTitle>
                    </div>

                    <div className="flex items-center space-x-2 bg-background px-4 py-2 rounded-full border shadow-sm">
                        <Checkbox
                            id={`combined-${index}`}
                            checked={isCombined}
                            onCheckedChange={(checked) => {
                                form.setValue(`machines.${index}.isShiftCombined`, checked);
                                if (checked && !form.getValues(`machines.${index}.shiftData.combined`)) {
                                    form.setValue(`machines.${index}.shiftData.combined`, {
                                        operatorName: "", productionCount: 0, downtimes: []
                                    });
                                }
                            }}
                        />
                        <Label htmlFor={`combined-${index}`} className="text-sm font-medium cursor-pointer">
                            Combined Shift
                        </Label>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {isCombined ? (
                    <ShiftSection label="Combined Shift" path={`machines.${index}.shiftData.combined`} form={form} type="combined" />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ShiftSection label="Day Shift" path={`machines.${index}.shiftData.day`} form={form} type="day" />
                        <div className="hidden lg:block w-px bg-border h-full mx-auto" />
                        <ShiftSection label="Night Shift" path={`machines.${index}.shiftData.night`} form={form} type="night" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ShiftSection({ label, path, form, type }: { label: string; path: string; form: any; type: string }) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `${path}.downtimes`,
    });

    const getIcon = () => {
        if (type === "day") return <span className="text-orange-500">☀️</span>;
        if (type === "night") return <span className="text-blue-500">🌙</span>;
        return <span className="text-green-500">📦</span>;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                {getIcon()}
                <h4 className="font-bold text-lg uppercase tracking-wider">{label}</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name={`${path}.operatorName`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" /> Operator Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter name" {...field} className="bg-background" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`${path}.productionCount`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><Calculator className="w-4 h-4" /> Production (KG)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} className="bg-background font-mono" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="pt-4 border-t border-dashed">
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Downtime Records
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ from: "", to: "", reason: "" })}
                        className="h-8 text-xs bg-muted/40"
                    >
                        <Plus className="w-3 h-3 mr-1" /> Add Downtime
                    </Button>
                </div>

                <div className="space-y-3">
                    {fields.map((field, dIndex) => (
                        <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-muted/20 p-3 rounded-lg border border-border/50 relative group">
                            <div className="grid grid-cols-2 gap-2 w-full sm:w-[220px]">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase">From</Label>
                                    <Input type="time" {...form.register(`${path}.downtimes.${dIndex}.from`)} className="h-9 px-2 bg-background border-muted" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase">To</Label>
                                    <Input type="time" {...form.register(`${path}.downtimes.${dIndex}.to`)} className="h-9 px-2 bg-background border-muted" />
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-1">
                                <Label className="text-[10px] uppercase">Reason</Label>
                                <Input placeholder="Reason for downtime" {...form.register(`${path}.downtimes.${dIndex}.reason`)} className="h-9 bg-background border-muted" />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(dIndex)}
                                className="h-9 w-9 text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <p className="text-xs text-muted-foreground italic text-center py-2 bg-muted/10 rounded-md">
                            No downtime records for this shift.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
