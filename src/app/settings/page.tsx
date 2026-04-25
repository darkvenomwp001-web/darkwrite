
"use client"

import React from 'react'
import { AppShell } from '@/components/writing/app-shell'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings2, User, Shield, Zap, Palette, Bell, Cloud } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <AppShell>
      <ScrollArea className="flex-1 p-8 md:p-12 bg-[#09090b]">
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
          <header className="space-y-3 pt-8 md:pt-0">
            <div className="flex items-center gap-3">
              <Settings2 className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tighter text-white">Sanctuary Settings</h1>
            </div>
            <p className="text-muted-foreground italic">Calibrate your high-fidelity writing environment.</p>
          </header>

          <div className="grid gap-8">
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <User className="w-3 h-3" /> Profile Identity
              </h3>
              <Card className="bg-white/[0.02] border-white/5 rounded-3xl overflow-hidden">
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                      A
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Author Identity</h4>
                      <p className="text-sm text-muted-foreground">Managing secure anonymous session</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">Update Alias</Button>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Palette className="w-3 h-3" /> Appearance & Vibe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white font-bold">Focus Mode Shadows</Label>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">High contrast backdrop</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Card>
                <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white font-bold">Interface Glow</Label>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Subtle primary accents</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Card>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Shield className="w-3 h-3" /> Integrity & Security
              </h3>
              <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div className="space-y-1">
                    <h4 className="text-white font-bold">Sanctuary Lock</h4>
                    <p className="text-sm text-muted-foreground">Require Sanctuary Key on every session launch</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-white font-bold">Cloud Encryption</h4>
                    <p className="text-sm text-muted-foreground">Real-time AES-256 equivalent manuscript protection</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                    <Cloud className="w-3 h-3" /> Active
                  </div>
                </div>
              </Card>
            </section>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex justify-end gap-4">
            <Button variant="ghost" className="rounded-xl text-muted-foreground">Restore Factory Defaults</Button>
            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white px-8 font-bold">Commit Changes</Button>
          </div>
        </div>
      </ScrollArea>
    </AppShell>
  );
}
