"use client"

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NepaliDatePicker } from "@/components/NepaliDatePicker";
import { getTodayBSDate } from "date-picker-np"
import { fetchPokas, recordSale, Poka } from "@/lib/poka";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, cleanNumber } from "@/lib/utils";

interface SaleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    location: 'biratnagar' | 'birgunj';
}

export function SaleDialog({ open, onOpenChange, onSuccess, location }: SaleDialogProps) {
    const [availablePokas, setAvailablePokas] = useState<Poka[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [date, setDate] = useState(getTodayBSDate());

    useEffect(() => {
        if (open) {
            loadAvailableStock();
            setSelectedIds([]);
        }
    }, [open]);

    const loadAvailableStock = async () => {
        const data = await fetchPokas({ location, status: 'available' });
        setAvailablePokas(data);
    };

    const togglePoka = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleRecordSale = async () => {
        if (selectedIds.length === 0) return;
        setLoading(true);
        try {
            const res = await recordSale({
                pokaIds: selectedIds,
                date,
            });
            if (res.success) {
                onSuccess();
                onOpenChange(false);
            } else {
                alert(res.message || "Failed to record sale");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const filteredPokas = availablePokas.filter(p =>
        p.poka_no.toLowerCase().includes(search.toLowerCase()) ||
        p.shade_no.toLowerCase().includes(search.toLowerCase())
    );

    const totalKgSelected = availablePokas
        .filter(p => selectedIds.includes(p._id))
        .reduce((sum, p) => sum + p.kg, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Record Sale from {location === 'biratnagar' ? 'Biratnagar' : 'Birgunj'}</DialogTitle>
                    <p className="text-muted-foreground text-sm">Select poka(s) to sell directly from {location} godown.</p>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Date</label>
                        <NepaliDatePicker
                            value={date}
                            onChange={(val) => setDate(val || getTodayBSDate())}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Available Stock</label>
                        <div className="h-[42px] flex items-center px-4 bg-muted/30 border border-border rounded-lg font-medium text-muted-foreground text-xs">
                            {cleanNumber(availablePokas.reduce((sum, p) => sum + p.kg, 0))} kg / {cleanNumber(availablePokas.reduce((sum, p) => sum + p.meter, 0))} mtr
                        </div>
                    </div>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Poka No or Shade No..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto border rounded-xl">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left w-10">Select</th>
                                <th className="px-4 py-3 text-left">Poka No</th>
                                <th className="px-4 py-3 text-left">Shade No</th>
                                <th className="px-4 py-3 text-right">Meter</th>
                                <th className="px-4 py-3 text-right">Kg</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredPokas.map((p) => (
                                <tr
                                    key={p._id}
                                    className={cn(
                                        "hover:bg-muted/30 cursor-pointer transition-colors",
                                        selectedIds.includes(p._id) && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                    onClick={() => togglePoka(p._id)}
                                >
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.includes(p._id)}
                                            onCheckedChange={() => togglePoka(p._id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-primary">{p.poka_no}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-secondary px-2 py-0.5 rounded text-xs">{p.shade_no}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">{p.meter} mtr</td>
                                    <td className="px-4 py-3 text-right">{p.kg} kg</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <DialogFooter className="mt-6 gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg h-11 px-6">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRecordSale}
                        disabled={selectedIds.length === 0 || loading}
                        className="bg-red-400 hover:bg-red-500 text-white rounded-lg h-11 px-8 min-w-[200px]"
                    >
                        {loading ? "Recording..." : `Record Sale (${selectedIds.length} Pokas)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
