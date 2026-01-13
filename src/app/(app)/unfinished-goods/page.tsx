"use client"

import React, { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { getUnfinishedGoodsColumns } from "./unfinished-goods-columns"
import { fetchUnfinishedGoodsList, deleteUnfinishedGoods } from "@/lib/unfinishedGoods"
import { UnfinishedGoodsFormDialog } from "./Unfinished-goodsFormDialog"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { UnfinishedGoods } from "@/lib/unfinishedGoods"
import { getTodayBSDate } from "date-picker-np"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileDown, Plus, RefreshCw, Table as TableIcon } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const NEPALI_MONTHS = [
  { label: "All Months", value: "all" },
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
]

export default function UnfinishedGoodsStockPage() {
  const [data, setData] = useState<UnfinishedGoods[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [formOpen, setFormOpen] = useState<boolean>(false)
  const [selectedUnfinishedGoods, setSelectedUnfinishedGoods] = useState<UnfinishedGoods | undefined>(undefined)

  // Today's BS date for defaults
  const todayBS = useMemo(() => getTodayBSDate(), [])
  const [todayYear, todayMonth] = useMemo(() => todayBS.split("-"), [todayBS])

  const [selectedMonth, setSelectedMonth] = useState<string>(todayMonth || "all")
  const [selectedYear, setSelectedYear] = useState<string>(todayYear || "all")

  // Generate years list dynamically (Current year +/- 5 years)
  const yearOptions = useMemo(() => {
    const current = parseInt(todayYear || "2081")
    const years = [{ label: "All Years", value: "all" }]
    for (let i = current - 5; i <= current + 5; i++) {
      years.push({ label: `${i}`, value: `${i}` })
    }
    return years
  }, [todayYear])

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const list = await fetchUnfinishedGoodsList()
      setData(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    loadData()
  }

  const handleAddNew = () => {
    setSelectedUnfinishedGoods(undefined)
    setFormOpen(true)
  }

  const handleEdit = (UnfinishedGoods: UnfinishedGoods) => {
    setSelectedUnfinishedGoods(UnfinishedGoods)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteUnfinishedGoods(deleteId)
      setDeleteId(null)
      loadData()
    } catch (error) {
      console.error("Delete error:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const parts = item.date.split("-")
      if (parts.length < 2) return false

      const itemYear = parts[0]
      const itemMonth = parts[1]

      const yearMatch = selectedYear === "all" || itemYear === selectedYear
      const monthMatch = selectedMonth === "all" || itemMonth === selectedMonth

      return yearMatch && monthMatch
    })
  }, [data, selectedYear, selectedMonth])



  const exportToCSV = () => {
    if (!filteredData.length) return
    const headers = ["Date", "Opening Balance", "Received", "Finished_meter", "Finished_kg", "Total", "Balance"]
    const rows = filteredData.map(item => [
      item.date,
      item.opening_Balance,
      item.received,
      item.finished_meter,
      item.finished_kg,
      item.total,
      item.balance
    ])

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `unfinished_goods_${selectedYear}_${selectedMonth}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    if (!filteredData.length) return;

    const doc = new jsPDF() as any;
    const tableColumn = ["Date", "Opening Balance", "Received", "Finished_meter", "Finished_kg", "Total", "Balance"];
    const tableRows: any[] = [];

    filteredData.forEach(item => {
      const rowData = [
        item.date,
        item.opening_Balance,
        item.received,
        item.finished_meter,
        item.finished_kg,
        item.total,
        item.balance
      ];
      tableRows.push(rowData);
    });

    const monthLabel = NEPALI_MONTHS.find(m => m.value === selectedMonth)?.label || "All Months";
    const yearLabel = selectedYear === "all" ? "All Years" : selectedYear;

    doc.setFontSize(22);
    doc.setTextColor(24, 143, 139);
    doc.text("Unfinished-Goods Stock Report", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Year: ${yearLabel}, Month: ${monthLabel}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [24, 143, 139], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 9, halign: 'center' },
      alternateRowStyles: { fillColor: [245, 250, 250] },
      margin: { top: 40 },
    });

    doc.save(`Unfinished-Goods_stock_report_${selectedYear}_${selectedMonth}.pdf`);
  }

  const columns = getUnfinishedGoodsColumns(handleEdit, (UnfinishedGoods: UnfinishedGoods) => setDeleteId(UnfinishedGoods._id))

  return (
    <div className="container mx-auto py-1 px-2 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-linear-to-br from-muted/50 to-muted/20 p-8 rounded-2xl border border-border/40 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-primary sm:text-3xl">Unfinished Goods</h1>

        </div>

        <div className="flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-end w-full xl:w-auto relative z-10">
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Year</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-11 bg-background border-border/60 hover:border-primary/40 focus:ring-primary/20 rounded-xl transition-all shadow-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                {yearOptions.map((y) => (
                  <SelectItem key={y.value} value={y.value} className="cursor-pointer rounded-lg mx-1 my-0.5">
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Month</span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-11 bg-background border-border/60 hover:border-primary/40 focus:ring-primary/20 rounded-xl transition-all shadow-sm">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                {NEPALI_MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="cursor-pointer rounded-lg mx-1 my-0.5">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 md:gap-3 h-11 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-full px-2 md:px-5 gap-2.5 rounded-xl border-border/60 hover:bg-background hover:shadow-md transition-all">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl shadow-2xl border-border/40">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground py-2 px-3">Datasets</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem onClick={exportToCSV} className="gap-3 py-3 cursor-pointer rounded-lg hover:bg-green-50 focus:bg-green-50 transition-colors group">
                  <div className="bg-green-100 p-2 rounded-lg text-green-700 group-hover:scale-110 transition-transform">
                    <TableIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Download CSV</span>
                    <span className="text-[10px] text-muted-foreground">Compatible with Excel</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} className="gap-3 py-3 cursor-pointer rounded-lg hover:bg-red-50 focus:bg-red-50 transition-colors group">
                  <div className="bg-red-100 p-2 rounded-lg text-red-700 group-hover:scale-110 transition-transform">
                    <FileDown className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Download PDF</span>
                    <span className="text-[10px] text-muted-foreground">Ready for Print</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleAddNew} className="h-full px-2 md:px-6 gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span>Add Entry</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={`h-11 w-11 rounded-xl border-border/60 hover:bg-background hover:shadow-md transition-all ${loading ? 'animate-spin' : ''}`}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Subtle Decorative Element */}
        <div className="absolute -right-12 -top-12 h-48 w-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-32 w-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <DataTable columns={columns} data={filteredData} />

      <UnfinishedGoodsFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={selectedUnfinishedGoods}

        onSuccess={loadData}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </div>
  )
}
