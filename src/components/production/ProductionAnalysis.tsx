"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Clock, Download, FileDown, History, TrendingUp, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

const NEPALI_MONTHS = [
    { label: "Baishakh", value: "01" },
    { label: "Jestha", value: "02" },
    { label: "Ashadh", value: "03" },
    { label: "Shrawan", value: "04" },
    { label: "Bhadra", value: "05" },
    { label: "Ashwin", value: "06" },
    { label: "Kartik", value: "07" },
    { label: "Mangshir", value: "08" },
    { label: "Poush", value: "09" },
    { label: "Magh", value: "10" },
    { label: "Falgun", value: "11" },
    { label: "Chaitra", value: "12" },
];

export function ProductionAnalysis() {
    const [year, setYear] = useState("2081");
    const [month, setMonth] = useState("04");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const resp = await fetch(`/api/production/analysis?year=${year}&month=${month}`);
            const json = await resp.json();
            setData(json);
        } catch (error) {
            console.error(error);
            alert("Failed to load analysis data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [year, month]);

    const exportPDF = () => {
        if (!data) return;

        const doc = new jsPDF() as any;
        const monthLabel = NEPALI_MONTHS.find(m => m.value === month)?.label || month;

        doc.setFontSize(22);
        doc.setTextColor(24, 143, 139);
        doc.text("Production Analysis Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Year: ${year}, Month: ${monthLabel}`, 14, 28);
        doc.text(`Total Production: ${data.totalProduction.toFixed(2)} KG`, 14, 34);
        doc.text(`Total Downtime: ${Math.floor(data.totalDowntimeMinutes / 60)}h ${data.totalDowntimeMinutes % 60}m`, 14, 40);

        // Machine Stats Table
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Machine Performance (Ranked by Downtime)", 14, 55);

        autoTable(doc, {
            head: [["Rank", "Machine", "Production (KG)", "Downtime"]],
            body: data.machineStats.map((ms: any, i: number) => [
                i + 1,
                `Machine #${ms.machineNumber}`,
                ms.production.toFixed(2),
                `${Math.floor(ms.downtimeMinutes / 60)}h ${ms.downtimeMinutes % 60}m`
            ]),
            startY: 60,
            theme: 'grid',
            headStyles: { fillColor: [24, 143, 139] }
        });

        // Reason Stats Table
        const lastY = (doc as any).lastAutoTable.finalY + 15;
        doc.text("Downtime Reasons Summary", 14, lastY);

        autoTable(doc, {
            head: [["Reason", "Total Downtime"]],
            body: data.reasonStats.map((rs: any) => [
                rs.reason,
                `${Math.floor(rs.minutes / 60)}h ${rs.minutes % 60}m`
            ]),
            startY: lastY + 5,
            theme: 'grid',
            headStyles: { fillColor: [143, 24, 70] }
        });

        doc.save(`Production_Analysis_${year}_${month}.pdf`);
    };

    if (loading && !data) return <div className="p-8 text-center">Loading analysis...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20 p-6 rounded-2xl border border-border">
                <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="flex-1 max-w-[150px]">
                        <Label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Year</Label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger>
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {["2080", "2081", "2082", "2083"].map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 max-w-[200px]">
                        <Label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Month</Label>
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {NEPALI_MONTHS.map(m => (
                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={exportPDF} variant="outline" className="gap-2 shrink-0 border-primary text-primary hover:bg-primary hover:text-white transition-all">
                    <FileDown className="w-4 h-4" /> Download Report (PDF)
                </Button>
            </div>

            {data && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            title="Monthly Production"
                            value={`${data.totalProduction.toFixed(2)} KG`}
                            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                            description="Total output for chosen month"
                            color="green"
                        />
                        <StatsCard
                            title="Total Downtime"
                            value={`${Math.floor(data.totalDowntimeMinutes / 60)}h ${data.totalDowntimeMinutes % 60}m`}
                            icon={<Clock className="w-6 h-6 text-orange-600" />}
                            description="Combined downtime across 10 machines"
                            color="orange"
                        />
                        <StatsCard
                            title="Most Common Issue"
                            value={data.reasonStats[0]?.reason || "N/A"}
                            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
                            description="Primary cause of production delays"
                            color="red"
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    <CardTitle>Machine performance Rank</CardTitle>
                                </div>
                                <CardDescription>Ranked by highest downtime minutes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Rank</TableHead>
                                            <TableHead>Machine</TableHead>
                                            <TableHead>Production</TableHead>
                                            <TableHead className="text-right">Downtime</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.machineStats.map((ms: any, i: number) => (
                                            <TableRow key={ms.machineNumber} className={i < 3 ? "bg-red-50/30" : ""}>
                                                <TableCell className="font-bold">{i + 1}</TableCell>
                                                <TableCell>Machine #{ms.machineNumber}</TableCell>
                                                <TableCell className="font-mono text-sm">{ms.production.toFixed(2)} KG</TableCell>
                                                <TableCell className="text-right font-mono text-sm text-red-600 font-medium">
                                                    {Math.floor(ms.downtimeMinutes / 60)}h {ms.downtimeMinutes % 60}m
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <History className="w-5 h-5 text-primary" />
                                    <CardTitle>Downtime Reasons</CardTitle>
                                </div>
                                <CardDescription>Consolidated delay causes for the month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reason</TableHead>
                                            <TableHead className="text-right">Total Duration</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.reasonStats.map((rs: any) => (
                                            <TableRow key={rs.reason}>
                                                <TableCell>{rs.reason}</TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {Math.floor(rs.minutes / 60)}h {rs.minutes % 60}m
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {data.reasonStats.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center py-4 text-muted-foreground italic">
                                                    No downtime records found for this period.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon, description, color }: any) {
    const colors: any = {
        green: "bg-green-500/10 border-green-500/20",
        orange: "bg-orange-500/10 border-orange-500/20",
        red: "bg-red-500/10 border-red-500/20",
    };

    return (
        <Card className={cn("border-2", colors[color])}>
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border">
                        {icon}
                    </div>
                    <Badge variant="outline" className="bg-white/50">{title}</Badge>
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function Label({ children, className }: any) {
    return <span className={cn("text-sm font-medium", className)}>{children}</span>;
}
