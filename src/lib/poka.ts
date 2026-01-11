export interface Poka {
    _id: string;
    date: string;
    poka_no: string;
    shade_no: string;
    meter: number;
    kg: number;
    location: 'biratnagar' | 'birgunj';
    status: 'available' | 'sold' | 'transferred';
    sale_date?: string;
    transfer_date?: string;
    received_date?: string;
    sale_price?: number;
    customer_name?: string;
    transferred_from?: string;
}

export async function fetchPokas(filters: { location?: string; status?: string; transferred_from?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.location) params.append("location", filters.location);
    if (filters.status) params.append("status", filters.status);
    if (filters.transferred_from) params.append("transferred_from", filters.transferred_from);

    const res = await fetch(`/api/pokas?${params.toString()}`);
    const json = await res.json();
    return json.success ? json.data : [];
}

export async function createPokas(data: { pokas: Partial<Poka>[]; date: string }) {
    const res = await fetch("/api/pokas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return await res.json();
}

export async function recordSale(data: { pokaIds: string[]; date: string; customerName?: string; salePrice?: number }) {
    const res = await fetch("/api/pokas/actions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'sale', ...data }),
    });
    return await res.json();
}

export async function transferPokas(data: { pokaIds: string[]; date: string; targetLocation: string }) {
    const res = await fetch("/api/pokas/actions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'transfer', ...data }),
    });
    return await res.json();
}

export async function fetchLatestBalance() {
    const res = await fetch("/api/pokas/balance");
    const json = await res.json();
    return json.success ? json.data : { meter: 0, kg: 0 };
}

export async function updatePoka(id: string, data: Partial<Poka>) {
    const res = await fetch(`/api/pokas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return await res.json();
}

export async function deletePoka(id: string) {
    const res = await fetch(`/api/pokas/${id}`, {
        method: "DELETE",
    });
    return await res.json();
}
