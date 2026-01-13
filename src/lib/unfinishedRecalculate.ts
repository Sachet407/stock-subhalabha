import UnfinishedGoodsModel from "@/model/UnfinishedGoods";

const cleanNumber = (num: number) =>
    Number.parseFloat(num.toPrecision(12));

export async function recalculateFromDateUnfinished(startDate: string) {
    // Get entries from startDate onwards
    const entries = await UnfinishedGoodsModel.find({
        date: { $gte: startDate }
    }).sort({ date: 1 });

    if (entries.length === 0) return;

    // Find previous entry
    const prev = await UnfinishedGoodsModel.findOne({
        date: { $lt: startDate }
    }).sort({ date: -1 });

    let runningBalance = prev ? prev.balance : entries[0].opening_Balance;

    for (const entry of entries) {
        entry.opening_Balance = cleanNumber(runningBalance);
        entry.total = cleanNumber(entry.opening_Balance + entry.received);
        entry.balance = cleanNumber(
            entry.total - entry.finished_kg
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
