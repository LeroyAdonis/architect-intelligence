"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SetupButton() {
    const [loading, setLoading] = useState(false);
    
    return (
        <Button 
            variant="outline" 
            onClick={async () => {
                setLoading(true);
                try {
                    await fetch('/api/setup', { method: 'POST' });
                    window.location.reload();
                } catch(e) {
                    console.error(e);
                }
                setLoading(false);
            }}
            disabled={loading}
        >
            {loading ? "Seeding..." : "Seed Database"}
        </Button>
    )
}
