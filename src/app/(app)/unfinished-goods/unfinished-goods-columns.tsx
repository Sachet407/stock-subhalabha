"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UnfinishedGoods } from "@/lib/unfinishedGoods"
import { cleanNumber } from "@/lib/utils"

export function getUnfinishedGoodsColumns(
    onEdit: (entry: UnfinishedGoods) => void,
    onDelete: (entry: UnfinishedGoods) => void
): ColumnDef<UnfinishedGoods>[] {
    return [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => <span className="font-medium">{row.getValue("date")}</span>
        },
        {
            accessorKey: "opening_Balance",
            header: "Opening Bal.",
            cell: ({ row }) => <span className="text-muted-foreground">{cleanNumber(row.getValue("opening_Balance")).toLocaleString()}</span>
        },
        {
            accessorKey: "received",
            header: "Received",
            cell: ({ row }) => <span className="text-emerald-500 font-medium">+{cleanNumber(row.getValue("received")).toLocaleString()}</span>
        },
        {
            accessorKey: "finished_meter",
            header: "Finished (Meter)",
            cell: ({ row }) => <span className="text-sky-500 font-medium">{cleanNumber(row.getValue("finished_meter")).toLocaleString()}</span>
        },
        {
            accessorKey: "finished_kg",
            header: "Finished (Kg)",
            cell: ({ row }) => <span className="text-amber-500 font-medium">-{cleanNumber(row.getValue("finished_kg")).toLocaleString()}</span>
        },
        {
            accessorKey: "total",
            header: "Total Stock",
            cell: ({ row }) => <span className="font-bold text-primary">{cleanNumber(row.getValue("total")).toLocaleString()}</span>
        },
        {
            accessorKey: "balance",
            header: "Closing Bal.",
            cell: ({ row }) => (
                <div className="bg-primary/5 py-1 px-3 rounded-full border border-primary/10 inline-block">
                    <span className="font-extrabold text-primary">{cleanNumber(row.getValue("balance")).toLocaleString()}</span>
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const entry = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted font-bold transition-all">
                                <MoreHorizontal className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 p-2 rounded-xl shadow-xl border-border/40">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground py-2 px-3">Entry Options</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/40" />
                            <DropdownMenuItem onClick={() => onEdit(entry)} className="gap-3 py-2.5 cursor-pointer rounded-lg hover:bg-muted">
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="font-medium">Edit Entry</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(entry)} className="gap-3 py-2.5 cursor-pointer rounded-lg text-destructive hover:bg-destructive/5 hover:text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="font-medium">Delete entry</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}
