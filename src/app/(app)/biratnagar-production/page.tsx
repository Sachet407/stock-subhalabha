"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Factory,
  Download,
  Plus,
  ShoppingCart,
  Truck,
  TrendingUp,
  Box,
  Scale,
  Ruler,
  Search
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { PokaFormDialog } from "@/components/production/PokaFormDialog"
import { SaleDialog } from "@/components/production/SaleDialog"
import { TransferDialog } from "@/components/production/TransferDialog"
import { EditPokaDialog } from "@/components/production/EditPokaDialog"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { fetchPokas, deletePoka, Poka } from "@/lib/poka"
import { cn, cleanNumber } from "@/lib/utils"
import DatePickerNP, { getTodayBSDate } from "date-picker-np"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Pencil, Trash2, Calendar, FilterX } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function BiratnagarProductionPage() {
  const [inventory, setInventory] = useState<Poka[]>([])
  const [sales, setSales] = useState<Poka[]>([])
  const [transfers, setTransfers] = useState<Poka[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [historyDate, setHistoryDate] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>(getTodayBSDate().split("-")[0])
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedPoka, setSelectedPoka] = useState<Poka | null>(null)
  const [dialogs, setDialogs] = useState({
    production: false,
    sale: false,
    transfer: false,
    edit: false,
    delete: false
  })

  const todayBS = useMemo(() => getTodayBSDate(), [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [inv, sold, moved] = await Promise.all([
        fetchPokas({ location: 'biratnagar', status: 'available' }),
        fetchPokas({ location: 'biratnagar', status: 'sold' }),
        fetchPokas({ transferred_from: 'biratnagar' })
      ])
      setInventory(inv)
      setSales(sold)
      setTransfers(moved)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const stats = useMemo(() => {
    const totalMeter = inventory.reduce((sum, p) => sum + p.meter, 0)
    const totalKg = inventory.reduce((sum, p) => sum + p.kg, 0)
    const allToday = [...inventory, ...sales, ...transfers].filter(p => p.date === todayBS)
    const todayCount = allToday.reduce((sum, p) => sum + p.kg, 0)

    const todaySalesKg = sales.filter(p => p.sale_date === todayBS).reduce((sum, p) => sum + p.kg, 0)
    const todayTransferredKg = transfers.filter(p => p.transfer_date === todayBS).reduce((sum, p) => sum + p.kg, 0)

    return [
      { label: "Available Pokas", value: inventory.length, icon: Box, color: "text-blue-500" },
      { label: "Total Meter", value: cleanNumber(totalMeter).toLocaleString(), unit: "mtr", icon: Ruler, color: "text-purple-500" },
      { label: "Total Kg", value: cleanNumber(totalKg).toLocaleString(), unit: "kg", icon: Scale, color: "text-orange-500" },
      { label: "Today's Production", value: cleanNumber(todayCount).toLocaleString(), unit: "kg", icon: TrendingUp, color: "text-green-500" },
      { label: "Today's Sales", value: cleanNumber(todaySalesKg).toLocaleString(), unit: "kg", icon: ShoppingCart, color: "text-red-500" },
      { label: "Today's Transferred", value: cleanNumber(todayTransferredKg).toLocaleString(), unit: "kg", icon: Truck, color: "text-blue-600" },
    ]
  }, [inventory, sales, transfers, todayBS])

  const generateExportHeaders = (tabTitle: string) => {
    let summary = "";
    if (historyDate) summary = `Date: ${historyDate}`;
    else if (selectedYear || selectedMonth) {
      const monthName = nepaliMonths.find(m => m.value === selectedMonth)?.label || "All Months";
      summary = `Year: ${selectedYear}${selectedMonth ? `, Month: ${monthName}` : ""}`;
    }
    if (search) summary += (summary ? " | " : "") + `Search: "${search}"`;
    return { tabTitle, summary };
  }

  const exportPDF = (data: Poka[], title: string) => {
    const { tabTitle, summary } = generateExportHeaders(title);
    const doc = new jsPDF()

    // Professional Header
    doc.setFontSize(22)
    doc.setTextColor(24, 143, 139)
    doc.text("STOCK MANAGEMENT", 14, 20)

    doc.setFontSize(14)
    doc.setTextColor(60)
    doc.text(`Biratnagar: ${tabTitle}`, 14, 30)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${todayBS}${summary ? ` | Filters: ${summary}` : ""}`, 14, 38)

    const isSales = title.toLowerCase().includes('sales');
    const isTransfers = title.toLowerCase().includes('transfer');

    const headers = isSales
      ? [['Poka No', 'Shade', 'Meter', 'Kg', 'Location', 'Sale Date']]
      : isTransfers
        ? [['Poka No', 'Shade', 'Meter', 'Kg', 'Destination', 'Transfer Date']]
        : [['Poka No', 'Shade', 'Meter', 'Kg', 'Date']];

    const tableData = data.map(p => {
      if (isSales) return [p.poka_no, p.shade_no, cleanNumber(p.meter), cleanNumber(p.kg), p.location || "biratnagar", p.sale_date || ""];
      if (isTransfers) return [p.poka_no, p.shade_no, cleanNumber(p.meter), cleanNumber(p.kg), p.location || "birgunj", p.transfer_date || ""];
      return [p.poka_no, p.shade_no, cleanNumber(p.meter), cleanNumber(p.kg), p.date || ""];
    });

    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [24, 143, 139], fontSize: 9 },
      styles: { fontSize: 8 },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    })

    doc.save(`biratnagar_${title.toLowerCase().replace(/\s+/g, '_')}_${todayBS}.pdf`)
  }

  const exportCSV = (data: Poka[], title: string) => {
    const isSales = title.toLowerCase().includes('sales');
    const isTransfers = title.toLowerCase().includes('transfer');

    const headers = isSales
      ? ["Poka No", "Shade No", "Meter", "Kg", "Location", "Sale Date"]
      : isTransfers
        ? ["Poka No", "Shade No", "Meter", "Kg", "Destination", "Transfer Date"]
        : ["Poka No", "Shade No", "Meter", "Kg", "Date"];

    const rows = data.map(p => {
      const escape = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
      if (isSales) return [p.poka_no, p.shade_no, p.meter, p.kg, p.location || "biratnagar", p.sale_date || ""].map(escape);
      if (isTransfers) return [p.poka_no, p.shade_no, p.meter, p.kg, p.location || "birgunj", p.transfer_date || ""].map(escape);
      return [p.poka_no, p.shade_no, p.meter, p.kg, p.date || ""].map(escape);
    });

    const csvContent = "\uFEFF" + [headers.map(h => `"${h}"`), ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `biratnagar_${title.toLowerCase().replace(/\s+/g, '_')}_${todayBS}.csv`
    link.click()
  }

  const filteredInventory = inventory.filter(p =>
    p.poka_no.toLowerCase().includes(search.toLowerCase()) ||
    p.shade_no.toLowerCase().includes(search.toLowerCase())
  )

  const applyHistoryFilter = (items: Poka[], dateField: 'sale_date' | 'transfer_date') => {
    return items.filter(p => {
      const matchesSearch = p.poka_no.toLowerCase().includes(search.toLowerCase()) ||
        p.shade_no.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      const dateVal = p[dateField];
      if (!dateVal) return false;

      if (historyDate) return dateVal === historyDate;

      const [year, month] = dateVal.split("-");
      const yearMatch = selectedYear ? year === selectedYear : true;
      const monthMatch = selectedMonth ? month === selectedMonth : true;

      return yearMatch && monthMatch;
    });
  };

  const filteredSales = applyHistoryFilter(sales, 'sale_date');
  const filteredTransfers = applyHistoryFilter(transfers, 'transfer_date');

  const nepaliMonths = [
    { label: "Baisakh", value: "01" },
    { label: "Jestha", value: "02" },
    { label: "Ashadh", value: "03" },
    { label: "Shrawan", value: "04" },
    { label: "Bhadra", value: "05" },
    { label: "Ashwin", value: "06" },
    { label: "Kartik", value: "07" },
    { label: "Mangsir", value: "08" },
    { label: "Poush", value: "09" },
    { label: "Magh", value: "10" },
    { label: "Falgun", value: "11" },
    { label: "Chaitra", value: "12" },
  ];

  const years = Array.from({ length: 11 }, (_, i) => (2080 + i).toString());

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-linear-to-br from-muted/50 to-muted/20 p-8 rounded-2xl border border-border/40 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Factory className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-light tracking-tight text-primary">Biratnagar Production</h1>
          </div>
          
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setDialogs({ ...dialogs, sale: true })} className="rounded-lg h-10">
            <ShoppingCart className="h-4 w-4 mr-2" /> Record Sale
          </Button>
          <Button variant="outline" onClick={() => setDialogs({ ...dialogs, transfer: true })} className="rounded-lg h-10">
            <Truck className="h-4 w-4 mr-2" /> Transfer to Birgunj
          </Button>
          <Button onClick={() => setDialogs({ ...dialogs, production: true })} className="rounded-lg h-10 bg-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Production
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-muted/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    {stat.unit && <span className="text-xs text-muted-foreground">{stat.unit}</span>}
                  </div>
                </div>
                <div className={cn("p-2 rounded-lg bg-background", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <Tabs defaultValue="current" className="w-full">
          <div className="px-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="current">Current Inventory</TabsTrigger>
              <TabsTrigger value="sales">Sales History</TabsTrigger>
              <TabsTrigger value="transfers">Transferred</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search poka/shade..."
                  className="pl-9 h-10 rounded-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportPDF(filteredInventory, "Current Inventory")}
                  className="h-10 text-red-600 border-red-100 hover:bg-red-50"
                  title="Export PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCSV(filteredInventory, "Current Inventory")}
                  className="h-10 text-green-600 border-green-100 hover:bg-green-50"
                  title="Export CSV"
                >
                  <Box className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="current" className="p-0 border-none m-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-y">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">Poka No</th>
                    <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">Shade No</th>
                    <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">Meter</th>
                    <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">Kg</th>
                    <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">Date</th>
                    <th className="px-6 py-4 text-center font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr><td colSpan={6} className="py-20 text-center text-muted-foreground animate-pulse">Loading inventory...</td></tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr><td colSpan={6} className="py-20 text-center text-muted-foreground">No stock available</td></tr>
                  ) : (
                    filteredInventory.map((p) => (
                      <tr key={p._id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4 font-bold text-primary tabular-nums">{p.poka_no}</td>
                        <td className="px-6 py-4">
                          <span className="bg-secondary/50 px-3 py-1 rounded-full text-xs font-medium border border-border/50">{p.shade_no}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium tabular-nums">{cleanNumber(p.meter)}</td>
                        <td className="px-6 py-4 text-right font-medium tabular-nums">{cleanNumber(p.kg)}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground text-xs">{p.date}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedPoka(p); setDialogs({ ...dialogs, edit: true }) }}
                              className="h-7 w-7 p-0 text-blue-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedPoka(p); setDialogs({ ...dialogs, delete: true }) }}
                              className="h-7 w-7 p-0 text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="p-0 border-none m-0">
            <div className="px-6 py-4 bg-muted/10 border-b flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Year</span>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px] h-9 bg-background">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Month</span>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[120px] h-9 bg-background">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Months</SelectItem>
                      {nepaliMonths.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

                <div className="flex items-center gap-2 z-50">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Date</span>
                  <DatePickerNP
                    value={historyDate || ""}
                    onChange={(val) => { setHistoryDate(val); if (val) { setSelectedMonth(""); setSelectedYear(""); } }}
                    inputContainerStyles={{ height: 36, width: 150, borderRadius: 8, background: 'white' }}
                    
                  />
                </div>

                {(historyDate || selectedMonth || selectedYear) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setHistoryDate(null); setSelectedYear(todayBS.split("-")[0]); setSelectedMonth(""); }}
                    className="text-muted-foreground h-9 px-2"
                  >
                    <FilterX className="h-4 w-4 mr-1" /> Reset
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border shadow-xs">
                  Showing <span className="text-primary font-bold">{filteredSales.length}</span> records
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPDF(filteredSales, "Sales History")}
                    className="h-9 px-2 text-red-600 border-red-50/50 hover:bg-red-50"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCSV(filteredSales, "Sales History")}
                    className="h-9 px-2 text-green-600 border-green-50/50 hover:bg-green-50"
                  >
                    <Box className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase text-muted-foreground">Poka No</th>
                    <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase text-muted-foreground">Shade</th>
                    <th className="px-6 py-4 text-right font-semibold text-[11px] uppercase text-muted-foreground">Meter</th>
                    <th className="px-6 py-4 text-right font-semibold text-[11px] uppercase text-muted-foreground">Kg</th>
                    <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase text-muted-foreground">Location</th>
                    <th className="px-6 py-4 text-right font-semibold text-[11px] uppercase text-muted-foreground">Sale Date</th>
                    <th className="px-6 py-4 text-center font-semibold text-[11px] uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSales.length === 0 ? (
                    <tr><td colSpan={7} className="py-20 text-center text-muted-foreground">No sales recorded for this selection.</td></tr>
                  ) : (
                    filteredSales.map((p) => (
                      <tr key={p._id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4 font-bold text-red-600 tabular-nums">{p.poka_no}</td>
                        <td className="px-6 py-4"><span className="bg-muted px-2 py-0.5 rounded text-xs">{p.shade_no}</span></td>
                        <td className="px-6 py-4 text-right tabular-nums">{cleanNumber(p.meter)}</td>
                        <td className="px-6 py-4 text-right tabular-nums">{cleanNumber(p.kg)}</td>
                        <td className="px-6 py-4 text-left">
                          <span className="capitalize text-xs font-medium bg-primary/5 text-primary px-2 py-0.5 rounded-full border border-primary/10">{p.location}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-muted-foreground tabular-nums">{p.sale_date}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedPoka(p); setDialogs({ ...dialogs, edit: true }) }}
                              className="h-7 w-7 p-0 text-blue-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="transfers" className="p-0 border-none m-0">
            <div className="px-6 py-4 bg-muted/10 border-b flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Year</span>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px] h-9 bg-background">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Month</span>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[120px] h-9 bg-background">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Months</SelectItem>
                      {nepaliMonths.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Date</span>
                  <DatePickerNP
                    value={historyDate || ""}
                    onChange={(val) => { setHistoryDate(val); if (val) { setSelectedMonth(""); setSelectedYear(""); } }}
                    inputContainerStyles={{ height: 36, width: 150, borderRadius: 8, background: 'white' }}
                  />
                </div>

                {(historyDate || selectedMonth || selectedYear) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setHistoryDate(null); setSelectedYear(todayBS.split("-")[0]); setSelectedMonth(""); }}
                    className="text-muted-foreground h-9 px-2"
                  >
                    <FilterX className="h-4 w-4 mr-1" /> Reset
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border shadow-xs">
                  Showing <span className="text-primary font-bold">{filteredTransfers.length}</span> records
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPDF(filteredTransfers, "Transferred History")}
                    className="h-9 px-2 text-red-600 border-red-50/50 hover:bg-red-50"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCSV(filteredTransfers, "Transferred History")}
                    className="h-9 px-2 text-green-600 border-green-50/50 hover:bg-green-50"
                  >
                    <Box className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase text-muted-foreground">Poka No</th>
                    <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase text-muted-foreground">Shade</th>
                    <th className="px-6 py-4 text-right font-semibold text-[11px] uppercase text-muted-foreground">Meter</th>
                    <th className="px-6 py-4 text-right font-semibold text-[11px] uppercase text-muted-foreground">Kg</th>
                    <th className="px-6 py-4 text-left font-semibold text-[11px] uppercase text-muted-foreground">Destination</th>
                    <th className="px-6 py-4 text-right font-semibold text-[11px] uppercase text-muted-foreground">Transfer Date</th>
                    <th className="px-6 py-4 text-center font-semibold text-[11px] uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTransfers.length === 0 ? (
                    <tr><td colSpan={7} className="py-20 text-center text-muted-foreground">No transfers recorded for this selection.</td></tr>
                  ) : (
                    filteredTransfers.map((p) => (
                      <tr key={p._id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4 font-bold text-blue-600 tabular-nums">{p.poka_no}</td>
                        <td className="px-6 py-4"><span className="bg-muted px-2 py-0.5 rounded text-xs">{p.shade_no}</span></td>
                        <td className="px-6 py-4 text-right tabular-nums">{cleanNumber(p.meter)}</td>
                        <td className="px-6 py-4 text-right tabular-nums">{cleanNumber(p.kg)}</td>
                        <td className="px-6 py-4 text-left">
                          <span className="capitalize text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">{p.location}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-muted-foreground tabular-nums">{p.transfer_date}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedPoka(p); setDialogs({ ...dialogs, edit: true }) }}
                              className="h-7 w-7 p-0 text-blue-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PokaFormDialog
        open={dialogs.production}
        onOpenChange={(val) => setDialogs({ ...dialogs, production: val })}
        onSuccess={loadData}
      />
      <SaleDialog
        open={dialogs.sale}
        onOpenChange={(val) => setDialogs({ ...dialogs, sale: val })}
        onSuccess={loadData}
        location="biratnagar"
      />
      <TransferDialog
        open={dialogs.transfer}
        onOpenChange={(val) => setDialogs({ ...dialogs, transfer: val })}
        onSuccess={loadData}
        fromLocation="biratnagar"
      />
      <EditPokaDialog
        open={dialogs.edit}
        onOpenChange={(val) => setDialogs({ ...dialogs, edit: val })}
        poka={selectedPoka}
        onSuccess={loadData}
        pageContext="biratnagar"
      />
      <DeleteConfirmDialog
        open={dialogs.delete}
        onOpenChange={(val) => setDialogs({ ...dialogs, delete: val })}
        onConfirm={async () => {
          if (selectedPoka) {
            await deletePoka(selectedPoka._id);
            setDialogs({ ...dialogs, delete: false });
            loadData();
          }
        }}
        title="Delete Poka"
        description="Are you sure you want to delete this poka record?"
      />
    </div>
  )
}