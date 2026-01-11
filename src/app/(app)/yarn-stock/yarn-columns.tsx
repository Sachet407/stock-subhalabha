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
import { Yarn } from "@/lib/fetchYarn"

export function getYarnColumns(
    onEdit: (yarn: Yarn) => void,
    onDelete: (yarn: Yarn) => void
): ColumnDef<Yarn>[] {
    return [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => <span className="font-medium">{row.getValue("date")}</span>
        },
        {
            accessorKey: "opening_Balance",
            header: "Opening Bal.",
            cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("opening_Balance")}</span>
        },
        {
            accessorKey: "purchase",
            header: "Purchase",
            cell: ({ row }) => <span className="text-green-600 font-medium">+{row.getValue("purchase")}</span>
        },
        {
            accessorKey: "consumption",
            header: "Consumption",
            cell: ({ row }) => <span className="text-orange-600 font-medium">-{row.getValue("consumption")}</span>
        },
        {
            accessorKey: "wastage",
            header: "Wastage",
            cell: ({ row }) => <span className="text-red-600 font-medium">-{row.getValue("wastage")}</span>
        },
        {
            accessorKey: "total",
            header: "Total Stock",
            cell: ({ row }) => <span className="font-bold text-primary">{row.getValue("total")}</span>
        },
        {
            accessorKey: "balance",
            header: "Closing Bal.",
            cell: ({ row }) => (
                <div className="bg-primary/5 py-1 px-3 rounded-full border border-primary/10 inline-block">
                    <span className="font-extrabold text-primary">{row.getValue("balance")}</span>
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const yarn = row.original
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
                            <DropdownMenuItem onClick={() => onEdit(yarn)} className="gap-3 py-2.5 cursor-pointer rounded-lg hover:bg-muted">
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="font-medium">Edit Entry</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(yarn)} className="gap-3 py-2.5 cursor-pointer rounded-lg text-destructive hover:bg-destructive/5 hover:text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors">
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
