export type UnfinishedGoods = {
  _id: string;
  date: string; // ISO string or BS date string
  opening_Balance: number;
  received: number;
  finished_meter: number;
  finished_kg: number;
  total: number;
  balance: number;
};

export async function fetchUnfinishedGoodsList(): Promise<UnfinishedGoods[]> {
  const res = await fetch("/api/unfinished-goods", { cache: "no-store" });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch unfinished goods list");
  return json.data as UnfinishedGoods[];
}

export async function createUnfinishedGoods(
  data: Omit<UnfinishedGoods, "_id" | "total" | "balance">
): Promise<UnfinishedGoods> {
  const res = await fetch("/api/unfinished-goods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to create unfinished goods.Check for duplicte entry.");
  return json.data as UnfinishedGoods;
}

export async function updateUnfinishedGoods(
  id: string,
  data: Omit<UnfinishedGoods, "_id" | "total" | "balance">
): Promise<UnfinishedGoods> {
  const res = await fetch(`/api/unfinished-goods/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to update unfinished goods");
  return json.data as UnfinishedGoods;
}

export async function deleteUnfinishedGoods(id: string): Promise<void> {
  const res = await fetch(`/api/unfinished-goods/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to delete unfinished goods");
}
