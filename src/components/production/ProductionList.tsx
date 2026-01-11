"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Share2, Eye, Calendar, User, ArrowRight, History as HistoryIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsAppPreview } from "./WhatsAppPreview";

interface ProductionListProps {
    entries: any[];
    onEdit: (entry: any) => void;
    onDelete: (id: string) => void;
    loading?: boolean;
}

export function ProductionList({ entries, onEdit, onDelete, loading }: ProductionListProps) {
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    if (loading) return <div className="text-center py-10">Loading entries...</div>;

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Date (BS)</TableHead>
                        <TableHead>Production (KG)</TableHead>
                        <TableHead>Main Operators</TableHead>
                        <TableHead>Machine Summary</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry) => (
                        <TableRow key={entry._id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-semibold">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    {entry.bsDate}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-sm px-3 py-1">
                                    {entry.totalProduction.toFixed(2)} KG
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
                                    {getUniqueOperators(entry).slice(0, 3).map((op, i) => (
                                        <Badge key={i} variant="outline" className="text-[10px] capitalize">
                                            {op}
                                        </Badge>
                                    ))}
                                    {getUniqueOperators(entry).length > 3 && (
                                        <span className="text-[10px] text-muted-foreground">+{getUniqueOperators(entry).length - 3} more</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    {entry.machines.map((m: any) => (
                                        <div
                                            key={m.machineNumber}
                                            title={`M${m.machineNumber}: ${getMachineProd(m)} KG`}
                                            className={cn(
                                                "w-6 h-6 rounded flex items-center justify-center text-[10px] border",
                                                getMachineProd(m) > 0 ? "bg-green-500/10 text-green-700 border-green-200" : "bg-muted text-muted-foreground border-border"
                                            )}
                                        >
                                            {m.machineNumber}
                                        </div>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50">
                                                <Share2 className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Share Production Report</DialogTitle>
                                            </DialogHeader>
                                            <WhatsAppPreview entry={entry} />
                                        </DialogContent>
                                    </Dialog>

                                    <Button variant="ghost" size="icon" onClick={() => onEdit(entry)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>

                                    <Button variant="ghost" size="icon" onClick={() => onDelete(entry._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {entries.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-muted rounded-full">
                                        <HistoryIcon className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p>No production history found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function getUniqueOperators(entry: any) {
    const ops = new Set<string>();
    entry.machines.forEach((m: any) => {
        if (m.isShiftCombined && m.shiftData.combined?.operatorName) ops.add(m.shiftData.combined.operatorName);
        if (m.shiftData.day?.operatorName) ops.add(m.shiftData.day.operatorName);
        if (m.shiftData.night?.operatorName) ops.add(m.shiftData.night.operatorName);
    });
    return Array.from(ops);
}

function getMachineProd(m: any) {
    if (m.isShiftCombined) return m.shiftData.combined?.productionCount || 0;
    return (m.shiftData.day?.productionCount || 0) + (m.shiftData.night?.productionCount || 0);
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
