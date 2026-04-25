"use client"

import React, { useState } from 'react'
import { Sparkles, Wand2, Lightbulb, CheckCircle, ChevronDown, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { aiWritingEnhancer, type AiWritingEnhancerOutput } from '@/ai/flows/ai-writing-enhancer-flow'
import { generateAiPrompt } from '@/ai/flows/ai-prompt-generator-flow'
import { Badge } from '@/components/ui/badge'

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
    <div className="w-80 border-l bg-card flex flex-col h-full font-ui shadow-2xl">
      <div className="p-4 border-b flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-bold">AI Companion</h2>
      </div>

      <Tabs defaultValue="enhance" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-muted/30">
          <TabsTrigger value="enhance" className="rounded-none data-[state=active]:bg-card">Enhance</TabsTrigger>
          <TabsTrigger value="prompt" className="rounded-none data-[state=active]:bg-card">Inspiration</TabsTrigger>
        </TabsList>

        <TabsContent value="enhance" className="flex-1 flex flex-col p-4 overflow-hidden mt-0">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <Button 
              onClick={handleEnhance} 
              disabled={loading || !currentText.trim()}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Analyze Writing
            </Button>

            <ScrollArea className="flex-1">
              {!enhancements && !loading && (
                <div className="text-center py-12 space-y-2 opacity-50">
                  <Lightbulb className="w-8 h-8 mx-auto" />
                  <p className="text-sm">Run analysis to see grammar and style suggestions.</p>
                </div>
              )}

              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-md" />
                  ))}
                </div>
              )}

              {enhancements && (
                <div className="space-y-6 pb-6 animate-fade-in">
                  {enhancements.grammarSuggestions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase">Grammar & Spelling</h3>
                      {enhancements.grammarSuggestions.map((s, i) => (
                        <Card key={i} className="border-l-4 border-l-red-500 bg-background/50">
                          <CardContent className="p-3 text-sm space-y-2">
                            <div className="line-through opacity-50">{s.original}</div>
                            <div className="text-green-400 font-medium">Suggestion: {s.suggestion}</div>
                            <div className="text-xs text-muted-foreground">{s.explanation}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {enhancements.styleSuggestions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase">Style & Flow</h3>
                      {enhancements.styleSuggestions.map((s, i) => (
                        <Card key={i} className="border-l-4 border-l-accent bg-background/50">
                          <CardContent className="p-3 text-sm space-y-2">
                            <div className="text-foreground">{s.original}</div>
                            <div className="text-accent font-medium italic">Better: {s.suggestion}</div>
                            <div className="text-xs text-muted-foreground">{s.explanation}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {enhancements.overallFeedback && (
                    <div className="space-y-2 pt-2">
                       <h3 className="text-xs font-bold text-muted-foreground uppercase">Overall Review</h3>
                       <p className="text-sm italic leading-relaxed text-muted-foreground">{enhancements.overallFeedback}</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="prompt" className="flex-1 flex flex-col p-4 overflow-hidden mt-0">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => handleGeneratePrompt('mysterious')} className="text-xs">Mystery</Button>
              <Button size="sm" variant="outline" onClick={() => handleGeneratePrompt('adventurous')} className="text-xs">Adventure</Button>
              <Button size="sm" variant="outline" onClick={() => handleGeneratePrompt('dark')} className="text-xs">Dark</Button>
              <Button size="sm" variant="outline" onClick={() => handleGeneratePrompt('humorous')} className="text-xs">Humor</Button>
            </div>

            <ScrollArea className="flex-1">
              {prompt && !loading && (
                <div className="animate-fade-in space-y-4">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Inspiration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-sm leading-relaxed text-foreground/90">
                      {prompt}
                    </CardContent>
                  </Card>
                  <Button variant="ghost" className="w-full text-xs" onClick={() => setPrompt(null)}>
                    Clear and try another
                  </Button>
                </div>
              )}

              {!prompt && !loading && (
                <div className="text-center py-12 space-y-2 opacity-50">
                  <Sparkles className="w-8 h-8 mx-auto" />
                  <p className="text-sm">Need a spark? Select a tone above to generate a prompt based on your current story.</p>
                </div>
              )}
              
              {loading && <div className="h-48 bg-muted animate-pulse rounded-md" />}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
