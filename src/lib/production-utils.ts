import { ProductionEntry } from "@/model/ProductionModel";

/**
 * Formats a production entry into a WhatsApp-shareable message string.
 */
export const formatWhatsAppMessage = (entry: ProductionEntry): string => {
    let message = `==============================\n`;
    message += `🥰 *PRODUCTION REPORT*\n`;
    message += `==============================\n`;
    message += `📆 Date: *${entry.bsDate}*\n`;
    message += `🔢 Total Production: *${entry.totalProduction?.toFixed(2)} KG*\n`;
    message += `------------------------------\n`;

    // Separate Day and Night collections
    const dayShiftDetails: string[] = [];
    const nightShiftDetails: string[] = [];
    const dayDowntimes: string[] = [];
    const nightDowntimes: string[] = [];

    let totalDayProduction = 0;
    let totalNightProduction = 0;

    entry.machines.forEach((m) => {
        if (m.isShiftCombined) {
            // If combined, we can treat it as both or just add to total
            // The requirement says: "if combined is ticked then no separate day and night otherwise day and night"
            // Looking at the example, it shows Day and Night shifts. 
            // If combined is ticked, we might want to show it as a special section or just "Total"
            // But let's follow the example's structure. If it's combined, maybe we put it in "DAY" or "TOTAL"?
            // Actually, the example shows Day and Night separately. 
            // If the user says "no separate day and night", maybe they want a "TOTAL PRODUCTION" section only?
            // "if combined is tcked then no separate day and night other wise day and night"
            // Let's assume if combined, we just show Machine records directly without the shift headers.
        }

        const day = m.shiftData.day;
        const night = m.shiftData.night;
        const combined = m.shiftData.combined;

        if (m.isShiftCombined && combined) {
            // Handle combined as a single block if needed, but the example has separate.
            // If combined, we'll just add to a 'Combined' category.
        } else {
            if (day) {
                dayShiftDetails.push(`☀ M${m.machineNumber}: ${day.productionCount.toFixed(2)} KG`);
                totalDayProduction += day.productionCount;
                day.downtimes.forEach(d => {
                    dayDowntimes.push(`   ⏰ M${m.machineNumber} | ${d.from} - ${d.to} | ${d.reason}`);
                });
            }
            if (night) {
                nightShiftDetails.push(`🌙 M${m.machineNumber}: ${night.productionCount.toFixed(2)} KG`);
                totalNightProduction += night.productionCount;
                night.downtimes.forEach(d => {
                    nightDowntimes.push(`   ⏰ M${m.machineNumber} | ${d.from} - ${d.to} | ${d.reason}`);
                });
            }
        }
    });

    if (dayShiftDetails.length > 0) {
        message += `☀ *DAY SHIFT PRODUCTION*\n`;
        message += dayShiftDetails.join('\n') + `\n`;
        message += `🌄 Total Day: *${totalDayProduction.toFixed(2)} KG*\n\n`;
        if (dayDowntimes.length > 0) {
            message += `⏰ Day Shift Downtime\n`;
            message += dayDowntimes.join('\n') + `\n`;
        }
        message += `------------------------------\n`;
    }

    if (nightShiftDetails.length > 0) {
        message += `🌙 *NIGHT SHIFT PRODUCTION*\n`;
        message += nightShiftDetails.join('\n') + `\n`;
        message += `🌌 Total Night: *${totalNightProduction.toFixed(2)} KG*\n\n`;
        if (nightDowntimes.length > 0) {
            message += `⏰ Night Shift Downtime\n`;
            message += nightDowntimes.join('\n') + `\n`;
        }
        message += `------------------------------\n`;
    }

    // Handle Combined if any (though usually it's either/or)
    const combinedEntries = entry.machines.filter(m => m.isShiftCombined);
    if (combinedEntries.length > 0) {
        message += `📦 *COMBINED PRODUCTION*\n`;
        let totalCombined = 0;
        combinedEntries.forEach(m => {
            if (m.shiftData.combined) {
                message += `🔹 M${m.machineNumber}: ${m.shiftData.combined.productionCount.toFixed(2)} KG\n`;
                totalCombined += m.shiftData.combined.productionCount;
                m.shiftData.combined.downtimes.forEach(d => {
                    message += `   ⏰ M${m.machineNumber} | ${d.from} - ${d.to} | ${d.reason}\n`;
                });
            }
        });
        message += `📦 Total Combined: *${totalCombined.toFixed(2)} KG*\n`;
        message += `------------------------------\n`;
    }

    message += `\n📤 Shared via Seraxmi Dashboard`;

    return message;
};

/**
 * Calculates downtime in hours and minutes from "HH:mm" strings.
 */
export const calculateDowntimeDuration = (from: string, to: string): string => {
    const [fh, fm] = from.split(':').map(Number);
    const [th, tm] = to.split(':').map(Number);

    let fromTotal = fh * 60 + fm;
    let toTotal = th * 60 + tm;

    if (toTotal < fromTotal) {
        // Crosses midnight
        toTotal += 24 * 60;
    }

    const diff = toTotal - fromTotal;
    const h = Math.floor(diff / 60);
    const m = diff % 60;

    return `${h}h ${m}m`;
};
