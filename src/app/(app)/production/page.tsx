"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductionForm } from "@/components/production/ProductionForm";
import { ProductionList } from "@/components/production/ProductionList";
import { ProductionAnalysis } from "@/components/production/ProductionAnalysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, History as HistoryIcon, Landmark as LandmarkIcon, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState("add");
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

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

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    const method = editingEntry ? "PUT" : "POST";
    const url = editingEntry ? `/api/production/${editingEntry._id}` : "/api/production";

    try {
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!resp.ok) throw new Error("Failed to save");

      alert(editingEntry ? "Entry updated successfully" : "Entry added successfully");
      setEditingEntry(null);
      fetchEntries();
      setActiveTab("history");
    } catch (error) {
      console.error(error);
      alert("Error saving production data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setActiveTab("add");
  };

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

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Sparkles className="w-5 h-5 fill-primary" />
            <span className="text-sm font-bold uppercase tracking-widest">Manufacturing Suite</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
            Production Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Monitor real-time machine output, track operator efficiency, and analyze downtime trends to optimize your factory floor.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-muted/40 p-4 rounded-2xl border">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Records</p>
            <p className="text-2xl font-black">{entries.length}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Latest Date</p>
            <p className="text-2xl font-black">{entries[0]?.bsDate || "N/A"}</p>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-10 p-1 bg-muted/50 rounded-2xl h-14 border max-w-2xl mx-auto">
          <TabsTrigger value="add" className="rounded-xl font-semibold gap-2 border-primary/20 data-[state=active]:shadow-lg data-[state=active]:bg-background">
            <PlusCircle className="w-4 h-4" /> Entry
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl font-semibold gap-2 border-primary/20 data-[state=active]:shadow-lg data-[state=active]:bg-background">
            <HistoryIcon className="w-4 h-4" /> Records
          </TabsTrigger>
          <TabsTrigger value="analysis" className="rounded-xl font-semibold gap-2 border-primary/20 data-[state=active]:shadow-lg data-[state=active]:bg-background">
            <LandmarkIcon className="w-4 h-4" /> Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-0 focus-visible:outline-none">
          <div className="max-w-5xl mx-auto">
            <Card className="border-2 shadow-xl shadow-primary/5">
              <CardHeader className="border-b bg-muted/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{editingEntry ? "Edit Production Entry" : "New Daily Production Report"}</CardTitle>
                    <CardDescription>Fill out machine stats and downtime records for each operator.</CardDescription>
                  </div>
                  {editingEntry && (
                    <Button variant="ghost" onClick={() => { setEditingEntry(null); setActiveTab("add"); }} className="text-destructive">
                      Cancel Editing
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <ProductionForm
                  initialData={editingEntry}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0 focus-visible:outline-none">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-primary" /> Historical Data
              </h3>
              <Button variant="outline" size="sm" onClick={fetchEntries} disabled={isLoading}>
                Refresh List
              </Button>
            </div>
            <ProductionList
              entries={entries}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-0 focus-visible:outline-none">
          <ProductionAnalysis />
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: hsl(var(--muted)/0.3);
        }
        ::-webkit-scrollbar-thumb {
          background: hsl(var(--primary)/0.2);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary)/0.4);
        }
      `}</style>
    </div>
  );
}