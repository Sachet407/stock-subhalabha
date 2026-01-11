"use client";

import React, { useState } from "react";
import { ProductionForm } from "@/components/production/ProductionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AddProductionPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: any) => {
        setIsLoading(true);
        try {
            const resp = await fetch("/api/production", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!resp.ok) throw new Error("Failed to save");

            alert("Entry added successfully");
            // Optional: Redirect or reset form
        } catch (error) {
            console.error(error);
            alert("Error saving production data");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2 text-primary">
                    <Sparkles className="w-5 h-5 fill-primary" />
                    <span className="text-sm font-bold uppercase tracking-widest">New Entry</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Add Production Data</h1>
                <p className="text-muted-foreground mt-2">
                    Record daily machine outputs, operator details, and downtime events.
                </p>
            </div>

            <Card className="border-2 shadow-xl shadow-primary/5">
                <CardHeader className="border-b bg-muted/10">
                    <CardTitle className="text-xl">Daily Production Report</CardTitle>
                    <CardDescription>Select a machine tab to enter specific details.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <ProductionForm onSubmit={handleSubmit} isLoading={isLoading} />
                </CardContent>
            </Card>
        </div>
    );
}
