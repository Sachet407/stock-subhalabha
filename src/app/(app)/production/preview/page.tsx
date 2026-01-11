"use client";

import React, { useState, useEffect } from "react";
import { ProductionList } from "@/components/production/ProductionList";
import { History, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewProductionPage() {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const resp = await fetch("/api/production");
            const data = await resp.json();
            setEntries(data);
        } catch (error) {
            console.error(error);
            alert("Failed to load production history");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) return;

        try {
            const resp = await fetch(`/api/production/${id}`, { method: "DELETE" });
            if (!resp.ok) throw new Error("Delete failed");
            alert("Entry deleted");
            fetchEntries();
        } catch (error) {
            console.error(error);
            alert("Failed to delete entry");
        }
    };

    const handleEdit = (entry: any) => {
        // Logic to handle edit - maybe redirect to add page with query param or open modal
        // For now, let's just alert as placeholder or implement a dialog
        alert("Edit functionality to be moved to a dedicate edit page or modal.");
    };

    return (
        <div className="container mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2 text-primary">
                        <Sparkles className="w-5 h-5 fill-primary" />
                        <span className="text-sm font-bold uppercase tracking-widest">Data History</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Production Preview</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and review past production records.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchEntries} disabled={isLoading} className="gap-2">
                    <History className="w-4 h-4" /> Refresh List
                </Button>
            </div>

            <ProductionList
                entries={entries}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={isLoading}
            />
        </div>
    );
}
