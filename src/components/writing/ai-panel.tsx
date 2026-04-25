
"use client"

import React, { useState } from 'react'
import { Sparkles, Wand2, Lightbulb, RefreshCw, X, Stars, Zap, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { aiWritingEnhancer, type AiWritingEnhancerOutput } from '@/ai/flows/ai-writing-enhancer-flow'
import { generateAiPrompt } from '@/ai/flows/ai-prompt-generator-flow'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AIPanelProps {
  currentText: string;
}

export function AIPanel({ currentText }: AIPanelProps) {
  const [loading, setLoading] = useState(false);
  const [enhancements, setEnhancements] = useState<AiWritingEnhancerOutput | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!currentText.trim()) return;
    setLoading(true);
    try {
      const result = await aiWritingEnhancer({ text: currentText });
      setEnhancements(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async (tone: string) => {
    setLoading(true);
    try {
      const result = await generateAiPrompt({ 
        existingIdea: currentText.slice(0, 500), 
        promptTone: tone 
      });
      setPrompt(result.generatedContent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full font-ui shadow-2xl bg-[#09090b] border-l border-white/5 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="font-bold tracking-tight text-lg leading-none">AI Companion</h2>
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1 truncate">Drafting Intelligence</span>
        </div>
      </div>

      <Tabs defaultValue="enhance" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-white/[0.01] border-b border-white/5 p-1 h-14 shrink-0">
          <TabsTrigger value="enhance" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-[10px] font-bold uppercase tracking-widest transition-all">Refine</TabsTrigger>
          <TabsTrigger value="prompt" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-[10px] font-bold uppercase tracking-widest transition-all">Inspire</TabsTrigger>
        </TabsList>

        <TabsContent value="enhance" className="flex-1 flex flex-col p-6 overflow-hidden mt-0">
          <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
            <Button 
              onClick={handleEnhance} 
              disabled={loading || !currentText.trim()}
              className="w-full h-12 gap-3 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 rounded-2xl glow-on-hover shrink-0"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Analyze Prose
            </Button>

            <ScrollArea className="flex-1">
              {!enhancements && !loading && (
                <div className="text-center py-16 space-y-4 opacity-30 px-4">
                  <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mx-auto border border-white/5">
                    <Stars className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-medium italic">Run an analysis to see stylistic, grammar, and flow suggestions for your current chapter.</p>
                </div>
              )}

              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-white/[0.01] animate-pulse rounded-2xl border border-white/5" />
                  ))}
                </div>
              )}

              {enhancements && (
                <div className="space-y-8 pb-12 animate-fade-in">
                  {enhancements.grammarSuggestions.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        Grammar & Syntax
                      </h3>
                      {enhancements.grammarSuggestions.map((s, i) => (
                        <Card key={i} className="border-l-4 border-l-red-500 bg-white/[0.01] border-white/5 rounded-2xl overflow-hidden shadow-sm">
                          <CardContent className="p-4 text-sm space-y-3">
                            <div className="line-through text-muted-foreground/40 italic text-xs leading-relaxed">{s.original}</div>
                            <div className="text-foreground font-semibold flex items-center gap-2">
                              <span className="text-red-500 shrink-0">→</span> {s.suggestion}
                            </div>
                            <div className="text-[10px] leading-relaxed opacity-60 bg-white/5 p-2 rounded-xl">{s.explanation}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {enhancements.styleSuggestions.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        Style & Impact
                      </h3>
                      {enhancements.styleSuggestions.map((s, i) => (
                        <Card key={i} className="border-l-4 border-l-primary bg-white/[0.01] border-white/5 rounded-2xl overflow-hidden shadow-sm">
                          <CardContent className="p-4 text-sm space-y-3">
                            <div className="text-muted-foreground italic leading-relaxed text-xs">"{s.original}"</div>
                            <div className="text-primary font-bold flex items-center gap-2 italic">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" /> {s.suggestion}
                            </div>
                            <div className="text-[10px] leading-relaxed opacity-60 bg-white/5 p-2 rounded-xl">{s.explanation}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {enhancements.overallFeedback && (
                    <div className="space-y-3 pt-6 border-t border-white/5">
                       <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2">Final Review</h3>
                       <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 text-xs italic leading-relaxed text-muted-foreground relative">
                         <Quote className="w-4 h-4 text-primary mb-3 opacity-30 shrink-0" />
                         {enhancements.overallFeedback}
                       </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="prompt" className="flex-1 flex flex-col p-6 overflow-hidden mt-0">
          <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <Button size="sm" variant="outline" onClick={() => handleGeneratePrompt('mysterious')} className="text-[9px] font-bold uppercase tracking-widest h-11 border-white/5 bg-white/[0.01] hover:bg-primary/10 hover:text-primary rounded-xl">Mystery</Button>
              <Button size="sm" variant="outline" onClick={() => handleGeneratePrompt('adventurous')} className="text-[9px] font-bold uppercase tracking-widest h-11 border-white/5 bg-white/[0.01] hover:bg-primary/10 hover:text-primary rounded-xl">Adventure</Button>
              <Button size="sm" variant="outline" onClick={() => handleGeneratePrompt('dark')} className="text-[9px] font-bold uppercase tracking-widest h-11 border-white/5 bg-white/[0.01] hover:bg-primary/10 hover:text-primary rounded-xl">Dark</Button>
              <Button size="sm" variant="outline" onClick={() => handleGeneratePrompt('humorous')} className="text-[9px] font-bold uppercase tracking-widest h-11 border-white/5 bg-white/[0.01] hover:bg-primary/10 hover:text-primary rounded-xl">Humor</Button>
            </div>

            <ScrollArea className="flex-1">
              {prompt && !loading && (
                <div className="animate-fade-in space-y-6 pb-12">
                  <Card className="bg-primary/5 border-primary/20 rounded-2xl overflow-hidden shadow-2xl">
                    <CardHeader className="p-5 pb-0">
                      <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest text-primary">
                        <Stars className="w-4 h-4 shrink-0" />
                        AI Inspiration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 text-sm leading-relaxed text-foreground/80 italic">
                      {prompt}
                    </CardContent>
                  </Card>
                  <Button variant="ghost" className="w-full text-[9px] font-bold uppercase tracking-widest py-6 hover:bg-white/5 rounded-xl transition-all" onClick={() => setPrompt(null)}>
                    Discard and refresh
                  </Button>
                </div>
              )}

              {!prompt && !loading && (
                <div className="text-center py-20 space-y-4 opacity-30 px-4">
                  <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mx-auto border border-white/5">
                    <Lightbulb className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-medium italic">Select a tone above to generate a spark of inspiration tailored to your current story arc.</p>
                </div>
              )}
              
              {loading && <div className="h-64 bg-white/[0.01] animate-pulse rounded-2xl border border-white/5" />}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
