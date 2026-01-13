export type Yarn = {
    _id: string;
    date: string; // ISO string or BS date string
    opening_Balance: number;
    purchase: number;
    consumption: number;
    wastage: number;
    total: number;
    balance: number;
};

export async function fetchYarnList(): Promise<Yarn[]> {
    const res = await fetch('/api/yarn-stock', { cache: 'no-store' });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to fetch yarn list');
    return json.data as Yarn[];
}

export async function createYarn(data: Omit<Yarn, '_id' | 'total' | 'balance'>): Promise<Yarn> {
    const res = await fetch('/api/yarn-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to create yarn.Check for duplicate entry.');
    return json.data as Yarn;
}

export async function updateYarn(id: string, data: Omit<Yarn, '_id' | 'total' | 'balance'>): Promise<Yarn> {
    const res = await fetch(`/api/yarn-stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to update yarn');
    return json.data as Yarn;
}

export async function deleteYarn(id: string): Promise<void> {
    const res = await fetch(`/api/yarn-stock/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to delete yarn');
}
