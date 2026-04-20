"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Map, Presentation } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function AdminDashboardClient({ workerStats, allSites }: { workerStats: any[], allSites: any[] }) {
    
    // Prep chart data
    const chartData = workerStats.map(w => ({
        name: w.name,
        visits: w.dailyVisits,
        target: w.targetVisits,
        fill: w.flag === "on_track" ? "hsl(var(--primary))" : (w.flag === "at_risk" ? "#f59e0b" : "#ef4444")
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                <p className="text-muted-foreground">Monitor field worker operations and manage sites.</p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview"><Activity className="w-4 h-4 mr-2" /> Live Progress</TabsTrigger>
                    <TabsTrigger value="sites"><Map className="w-4 h-4 mr-2" /> Master Sites</TabsTrigger>
                    <TabsTrigger value="reports"><Presentation className="w-4 h-4 mr-2" /> Reports</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Workers</p>
                                <h2 className="text-4xl font-bold text-slate-800">{workerStats.length}</h2>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Flagged At Risk</p>
                                <h2 className="text-4xl font-bold text-amber-500">{workerStats.filter(w => w.flag === "at_risk").length}</h2>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Missing Target</p>
                                <h2 className="text-4xl font-bold text-rose-500">{workerStats.filter(w => w.flag === "missing_target").length}</h2>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-3 md:row-span-3 bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col text-white">
                            <div className="mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">At Risk Notifications</h3>
                                <div className="space-y-4">
                                    {workerStats.filter(w => w.flag !== "on_track").length === 0 ? (
                                        <p className="text-sm text-slate-400">All tracking expected pace.</p>
                                    ) : workerStats.filter(w => w.flag !== "on_track").map(w => (
                                        <div key={w.id} className={`border-l-4 p-3 rounded-r-lg ${w.flag === 'missing_target' ? 'bg-rose-500/10 border-rose-500' : 'bg-amber-400/10 border-amber-400'}`}>
                                            <p className={`text-xs font-bold uppercase ${w.flag === 'missing_target' ? 'text-rose-400' : 'text-amber-400'}`}>
                                                {w.flag === 'missing_target' ? 'Missing Target' : 'Below Pace'}
                                            </p>
                                            <p className="text-sm font-semibold">{w.name}</p>
                                            <p className="text-[11px] text-slate-400 mt-1">{w.dailyVisits}/{w.targetVisits} sites visited. {w.dailyKm} km covered.</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-9 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-4">Worker KPI Pipeline</h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {workerStats.map(stat => (
                                    <WorkerKPICard key={stat.id} stat={stat} />
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="sites" className="mt-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="mb-6 border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold text-slate-800">Site Management Master List</h3>
                            <p className="text-sm text-slate-500">View existing inspection sites</p>
                        </div>
                        <div className="divide-y border rounded-lg overflow-hidden">
                            {allSites.map(s => (
                                <div key={s.id} className="p-4 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="font-semibold text-slate-800">{s.name}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{s.address}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${s.isActive ? 'text-blue-600 bg-blue-50 border border-blue-100' : 'text-slate-500 bg-slate-100 border border-slate-200'}`}>
                                        {s.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="mt-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="mb-6 border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold text-slate-800">Daily Visit Volume per Worker</h3>
                            <p className="text-sm text-slate-500">Visualizing tracking against daily baseline targets</p>
                        </div>
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="#cbd5e1" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{fill: '#f8fafc'}}
                                    />
                                    <Bar dataKey="visits" name="Logged Visits" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function WorkerKPICard({ stat }: { stat: any }) {
    let flagBadge = <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">On Track</span>;
    let borderClass = "border-slate-200";

    if (stat.flag === "at_risk") {
        flagBadge = <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded">At Risk</span>;
        borderClass = "border-amber-200";
    } else if (stat.flag === "missing_target") {
        flagBadge = <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-1 rounded">Missing Target</span>;
        borderClass = "border-rose-200 shadow-sm shadow-rose-100";
    }

    return (
        <div className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col gap-4 ${borderClass}`}>
            <div className="flex flex-row items-start justify-between">
                <div>
                    <h4 className="text-sm font-bold text-slate-800">{stat.name}</h4>
                    <p className="text-[11px] text-slate-400">{stat.email}</p>
                </div>
                {flagBadge}
            </div>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visits</span>
                        <span className="text-xs font-semibold text-slate-700">{stat.dailyVisits} / {stat.targetVisits}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.flag === "missing_target" ? "bg-rose-500" : stat.flag === "at_risk" ? "bg-amber-400" : "bg-blue-500"}`} style={{ width: `${stat.visitsPercent}%` }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distance</span>
                        <span className="text-xs font-semibold text-slate-700">{stat.dailyKm} / {stat.targetKm}km</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.flag === "missing_target" ? "bg-rose-500" : stat.flag === "at_risk" ? "bg-amber-400" : "bg-blue-500"}`} style={{ width: `${Math.min(100, Math.round((stat.dailyKm/stat.targetKm)*100))}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
