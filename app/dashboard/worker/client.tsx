"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logVisit, logInspection } from "./actions";
import { MapPin, Route, CheckCircle, PlusCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function WorkerDashboardClient({ userId, sites, dailyVisits, stats }: any) {
    const visitsPercent = Math.min(100, Math.round((stats.dailyVisits / stats.targetVisits) * 100));
    const kmPercent = Math.min(100, Math.round((stats.dailyKm / stats.targetKm) * 100));

    // Calculate flagging logic
    // Normally done server side but valid here for ui display.
    // Assuming 8-hour workday, proportional completion.
    // To simplify: if percent is less than half target and it's late in day...
    const hour = new Date().getHours();
    const expectedPercent = Math.max(0, Math.min(100, ((hour - 8) / 8) * 100)); // 8am to 4pm
    
    let visitStatus = "on track";
    if (visitsPercent < expectedPercent - 20) visitStatus = "at risk";
    if (hour >= 16 && visitsPercent < 100) visitStatus = "missing target";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Today's Progress</h1>
                    <p className="text-muted-foreground">Keep up the good work!</p>
                </div>
                <div className="flex gap-2">
                    <LogVisitModal userId={userId} sites={sites} />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Site Visits</p>
                            <h2 className="text-4xl font-bold text-slate-800">{stats.dailyVisits} <span className="text-sm font-normal text-slate-400">/ {stats.targetVisits}</span></h2>
                        </div>
                        <MapPin className="h-5 w-5 text-slate-300" />
                    </div>
                    <div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${visitsPercent}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <p className="text-xs text-slate-500 font-medium">{visitsPercent}% Complete</p>
                            <StatusBadge status={visitStatus} />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Kilometers</p>
                            <h2 className="text-3xl font-bold text-slate-800">{stats.dailyKm} <span className="text-sm font-normal text-slate-400">/ {stats.targetKm} KM</span></h2>
                        </div>
                        <Route className="h-5 w-5 text-slate-300" />
                    </div>
                    <div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${kmPercent}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-3">{kmPercent}% setup target</p>
                    </div>
                </div>
                
                <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col text-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">This Week</span>
                        <span className="text-sm font-bold">{stats.weeklyVisits} visits <span className="text-slate-300 mx-1">•</span> {stats.weeklyKm} km</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">This Month</span>
                        <span className="text-sm font-bold">{stats.monthlyVisits} visits <span className="text-slate-300 mx-1">•</span> {stats.monthlyKm} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</span>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">Field Worker</span>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4 mt-8">
                    <h2 className="text-xl font-bold text-slate-800">Sites Visited Today</h2>
                </div>
                
                {dailyVisits.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                        No visits logged today yet. Click "Log New Visit" to get started.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {dailyVisits.map((visit: any) => (
                            <div key={visit.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                                <div className="border-b border-slate-50 pb-4 mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-800">{visit.site.name}</h3>
                                            <p className="text-[11px] text-slate-400 uppercase tracking-wider">{visit.site.address}</p>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">{visit.kmCovered} km</span>
                                    </div>
                                </div>
                                <div>
                                    <LogInspectionModal visit={visit} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === "on track") return <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">On Track</span>
    if (status === "at risk") return <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded">At Risk</span>
    return <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-1 rounded">Missing Target</span>
}

function LogVisitModal({ userId, sites }: { userId: string, sites: any[] }) {
    const [open, setOpen] = useState(false);
    const [siteId, setSiteId] = useState("");
    const [customName, setCustomName] = useState("");
    const [customAddress, setCustomAddress] = useState("");
    const [km, setKm] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await logVisit({
                siteId,
                customSiteName: customName,
                customSiteAddress: customAddress,
                kmCovered: parseInt(km) || 0,
                workerId: userId
            });
            toast.success("Visit logged successfully");
            setOpen(false);
            setSiteId(""); setCustomName(""); setCustomAddress(""); setKm("");
        } catch (e) {
            toast.error("Failed to log visit");
        }
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Log New Visit</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Daily Visit</DialogTitle>
                    <DialogDescription>Record a new site visit explicitly.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Site Selection</Label>
                        <Select value={siteId} onValueChange={setSiteId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a site..." />
                            </SelectTrigger>
                            <SelectContent>
                                {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                <SelectItem value="NEW" className="font-bold text-primary">+ Add New Site Manually</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {siteId === "NEW" && (
                        <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                            <div className="space-y-2">
                                <Label>New Site Name</Label>
                                <Input required value={customName} onChange={e => setCustomName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>New Site Address</Label>
                                <Input required value={customAddress} onChange={e => setCustomAddress(e.target.value)} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Kilometers Covered to get here</Label>
                        <Input type="number" min="0" required value={km} onChange={e => setKm(e.target.value)} />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Saving..." : "Save Visit"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function LogInspectionModal({ visit }: { visit: any }) {
    const [open, setOpen] = useState(false);
    const [itemName, setItemName] = useState("");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState("ok");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await logInspection({
                visitId: visit.id,
                itemName,
                notes,
                status
            });
            toast.success("Inspection logged successfully");
            setOpen(false);
            setItemName(""); setNotes(""); setStatus("ok");
        } catch (e) {
            toast.error("Failed to log inspection");
        }
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full mt-2">Log Inspection</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Inspection Details</DialogTitle>
                    <DialogDescription>Record what was inspected at {visit.site.name}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>What was inspected?</Label>
                        <Input required placeholder="E.g. Fire Hydrant, HVAC, Wiring" value={itemName} onChange={e => setItemName(e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Condition / Status</Label>
                        <Select value={status} onValueChange={setStatus} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ok">Valid / Good</SelectItem>
                                <SelectItem value="issue">Minor Issue (Amber)</SelectItem>
                                <SelectItem value="critical">Critical Issue (Red)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input placeholder="Optional details..." value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Saving..." : "Save Inspection"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
