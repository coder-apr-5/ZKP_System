"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, ListChecks, Activity, Users, FileCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function ProviderDashboard() {
    const params = useParams();
    const providerId = params.providerId as string;
    const router = useRouter();
    const { toast } = useToast();

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" /> ID: <span className="font-mono bg-muted px-2 py-0.5 rounded">{providerId}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/provider/${providerId}/history`)}>
                        <ListChecks className="mr-2 h-4 w-4" /> Audit Logs
                    </Button>
                    <Button onClick={() => router.push(`/provider/request?provider=${providerId}`)}>
                        <Plus className="mr-2 h-4 w-4" /> New Verification Request
                    </Button>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">+2 from last hour</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98.5%</div>
                        <p className="text-xs text-muted-foreground">Based on last 100 requests</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Waiting for proof submission</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="requests">Open Requests</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest verification attempts across all branches.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {/* Mock Activity List */}
                                <div className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Complete Verification</p>
                                        <p className="text-sm text-muted-foreground">Pharmacy Branch #2 - Vaccination Check</p>
                                    </div>
                                    <div className="ml-auto font-medium text-green-600">Verified</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Failed Verification</p>
                                        <p className="text-sm text-muted-foreground">Insurance Portal - Pre-Authorization</p>
                                    </div>
                                    <div className="ml-auto font-medium text-red-600">Failed</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">New Request Created</p>
                                        <p className="text-sm text-muted-foreground">Lab - Blood Type Confirmation</p>
                                    </div>
                                    <div className="ml-auto font-medium text-muted-foreground">Pending</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Open Verification Requests</CardTitle>
                            <CardDescription>Requests currently awaiting patient proof submission.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No active requests found.</p>
                            <Button variant="link" className="px-0 text-primary" onClick={() => router.push(`/provider/request?provider=${providerId}`)}>
                                Create a new request
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
