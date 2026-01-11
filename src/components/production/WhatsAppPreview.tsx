"use client";

import React from "react";
import { ProductionEntry } from "@/model/ProductionModel";
import { formatWhatsAppMessage } from "@/lib/production-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";

interface WhatsAppPreviewProps {
    entry: ProductionEntry;
}

export function WhatsAppPreview({ entry }: WhatsAppPreviewProps) {
    const [copied, setCopied] = useState(false);
    const message = formatWhatsAppMessage(entry);

    const handleCopy = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        alert("Message copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenWhatsApp = () => {
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    };

    return (
        <Card className="border-2 border-green-500/20 bg-green-500/5 h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-green-500/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-green-800">WhatsApp Preview</CardTitle>
                            <CardDescription>Formatted summary for sharing</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col gap-4">
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-inner font-mono text-sm whitespace-pre-wrap flex-1 overflow-auto max-h-[500px]">
                    {message}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                    <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="w-full border-zinc-300 hover:bg-zinc-100"
                    >
                        {copied ? (
                            <><Check className="w-4 h-4 mr-2" /> Copied</>
                        ) : (
                            <><Copy className="w-4 h-4 mr-2" /> Copy Message</>
                        )}
                    </Button>
                    <Button
                        onClick={handleOpenWhatsApp}
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" /> Send to WhatsApp
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
