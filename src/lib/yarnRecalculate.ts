import YarnModel from "@/model/Yarn";

const cleanNumber = (num: number) =>
    Number.parseFloat(num.toPrecision(12));

export async function recalculateFromDate(startDate: string) {
    // Get entries from startDate onwards
    const entries = await YarnModel.find({
        date: { $gte: startDate }
    }).sort({ date: 1 });

    if (entries.length === 0) return;

    // Find previous entry
    const prev = await YarnModel.findOne({
        date: { $lt: startDate }
    }).sort({ date: -1 });

    let runningBalance = prev ? prev.balance : entries[0].opening_Balance;

    for (const entry of entries) {
        entry.opening_Balance = cleanNumber(runningBalance);
        entry.total = cleanNumber(entry.opening_Balance + entry.purchase);
        entry.balance = cleanNumber(
            entry.total - entry.consumption - entry.wastage
        );

        if (entry.balance < 0) {
            throw new Error(
                `Negative balance on ${entry.date}`
            );
        }

        runningBalance = entry.balance;
        await entry.save();
    }
}
