"use client";

import React from "react";
import { ProductionAnalysis } from "@/components/production/ProductionAnalysis";
import { BarChart3, Sparkles } from "lucide-react";

export default function AnalysisPage() {
    return (
        <div className="container mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2 text-primary">
                    <Sparkles className="w-5 h-5 fill-primary" />
                    <span className="text-sm font-bold uppercase tracking-widest">Analytics</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Production Analysis</h1>
                <p className="text-muted-foreground mt-2">
                    Deep dive into monthly performance, downtime trends, and machine efficiency.
                </p>
            </div>

            <ProductionAnalysis />
        </div>
    );
}
