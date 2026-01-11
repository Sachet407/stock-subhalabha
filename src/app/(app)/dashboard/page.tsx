"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Factory,
  Warehouse,
  TrendingUp,
  Truck,
  Activity,
  ArrowUpRight,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStats {
  biratnagar: { count: number, totalKg: number };
  birgunj: { count: number, totalKg: number };
  today: { salesKg: number, transferredKg: number };
  recentActivity: Array<{
    id: string;
    poka_no: string;
    shade_no: string;
    kg: number;
    type: 'Sale' | 'Transfer';
    location: string;
    date: string;
    updatedAt: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(res => {
        if (res.success) setStats(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time overview of your yarn stock operations.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Biratnagar Stock</CardTitle>
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Factory className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.biratnagar.totalKg.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-blue-600 dark:text-blue-400 font-medium">{stats?.biratnagar.count}</span> Active Pokas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Birgunj Godown</CardTitle>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Warehouse className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.birgunj.totalKg.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-purple-600 dark:text-purple-400 font-medium">{stats?.birgunj.count}</span> Available Pokas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Sales</CardTitle>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.today.salesKg.toLocaleString()} kg</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <ArrowUpRight className="h-3 w-3" /> Updated in real-time
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Transfers</CardTitle>
            <div className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Truck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.today.transferredKg.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              Inventory moved to Birgunj
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Activity Table */}
        <Card className="md:col-span-4 border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest sales and inventory transfers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Poka No</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Weight</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats?.recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold">{activity.poka_no}</div>
                            <div className="text-[10px] text-muted-foreground">Shade: {activity.shade_no}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          activity.type === 'Sale'
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                        )}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{activity.kg} kg</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{activity.date}</td>
                    </tr>
                  ))}
                  {stats?.recentActivity.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground italic">
                        No recent activity recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Location Snapshot */}
        <Card className="md:col-span-3 border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Location Snapshot</CardTitle>
                <CardDescription>Stock distribution by location</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Biratnagar</span>
                <span className="text-muted-foreground">{stats?.biratnagar.totalKg.toLocaleString()} kg</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(stats?.biratnagar.totalKg || 0) / ((stats?.biratnagar.totalKg || 0) + (stats?.birgunj.totalKg || 0) || 1) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Birgunj</span>
                <span className="text-muted-foreground">{stats?.birgunj.totalKg.toLocaleString()} kg</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${(stats?.birgunj.totalKg || 0) / ((stats?.biratnagar.totalKg || 0) + (stats?.birgunj.totalKg || 0) || 1) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Total Stock</div>
                  <div className="text-lg font-bold text-foreground">
                    {((stats?.biratnagar.totalKg || 0) + (stats?.birgunj.totalKg || 0)).toLocaleString()} kg
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-xs text-primary mb-1 font-medium">Total Pokas</div>
                  <div className="text-lg font-bold text-primary">
                    {((stats?.biratnagar.count || 0) + (stats?.birgunj.count || 0))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}