"use client";

import { UploadCloud, FileText, CheckCircle2, List, Sparkles } from "lucide-react";

export function HowItWorks() {
    return (
        <section className="py-24 relative overflow-hidden bg-black/40">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-2">
                        How It Works
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight">
                        Get Investment-Ready in 3 Simple Steps
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        From data to clarity—uncover insights, take action, and grow smarter in three simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1: Upload */}
                    <div className="group bg-black/40 border border-white/5 backdrop-blur-md rounded-3xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.2)] flex flex-col overflow-hidden relative min-h-[400px]">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-foreground mb-2">Upload Your Pitch Deck</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Upload your deck in PDF or PPT format. Our AI analyzes it across 15+ parameters in under 3 minutes.
                            </p>
                        </div>

                        {/* Mockup Area */}
                        <div className="mt-auto pt-8 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Concentric Circles */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                <div className="absolute inset-0 border border-white/5 rounded-full" />
                                <div className="absolute inset-8 border border-white/5 rounded-full" />
                                <div className="absolute inset-16 border border-white/5 rounded-full" />

                                {/* Center Icon */}
                                <div className="relative z-10 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.5)] group-hover:scale-110 transition-transform duration-300">
                                    <UploadCloud className="h-8 w-8 text-white" />
                                </div>

                                {/* Orbiting Icons */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm">
                                    <span className="text-[8px] font-bold text-white">PDF</span>
                                </div>
                                <div className="absolute bottom-10 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm">
                                    <span className="text-[8px] font-bold text-white">PPT</span>
                                </div>
                                <div className="absolute bottom-10 left-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm">
                                    <FileText className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Insights */}
                    <div className="group bg-black/40 border border-white/5 backdrop-blur-md rounded-3xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.2)] flex flex-col overflow-hidden relative min-h-[400px]">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-foreground mb-2">Get Actionable Insights</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Receive detailed feedback, readiness score, and personalized recommendations to improve your pitch.
                            </p>
                        </div>

                        {/* Mockup Area */}
                        <div className="mt-auto pt-8 flex items-center justify-center relative translate-y-6">
                            {/* Gauge Visualization */}
                            <div className="relative w-56 h-32 overflow-hidden">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full border-[12px] border-white/5 border-t-primary border-r-primary rotate-[-45deg] group-hover:rotate-[-25deg] transition-transform duration-700 ease-out" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-24 bg-gradient-to-t from-transparent to-white/50 origin-bottom rotate-[-45deg] group-hover:rotate-0 transition-transform duration-700 delay-100 ease-out z-10" />

                                {/* Floating Badges */}
                                <div className="absolute top-0 left-0 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 text-[10px] text-white flex items-center gap-1 group-hover:-translate-y-2 transition-transform duration-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Improvement
                                </div>
                                <div className="absolute top-4 right-0 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 text-[10px] text-white flex items-center gap-1 group-hover:-translate-y-2 transition-transform duration-500 delay-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Readiness
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">85<span className="text-base text-muted-foreground">/100</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Connect */}
                    <div className="group bg-black/40 border border-white/5 backdrop-blur-md rounded-3xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.2)] flex flex-col overflow-hidden relative min-h-[400px]">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-foreground mb-2">Connect & Raise</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Access matched investors, track your outreach, and manage your fundraising journey.
                            </p>
                        </div>

                        {/* Mockup Area */}
                        <div className="mt-auto pt-8 flex items-center justify-center relative translate-y-4">
                            {/* Card Stack / Envelope */}
                            <div className="relative w-56 h-40">
                                {/* Back Card */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-white/5 border border-white/5 rounded-xl rotate-[-6deg] group-hover:rotate-[-12deg] group-hover:-translate-x-16 transition-all duration-500" />
                                {/* Middle Card */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-white/10 border border-white/5 rounded-xl rotate-[6deg] group-hover:rotate-[12deg] group-hover:translate-x-8 transition-all duration-500" />

                                {/* Front Card (Active) */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-52 h-36 bg-neutral-900/90 border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-3 group-hover:-translate-y-2 transition-transform duration-300">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <div className="h-2 w-20 bg-white/20 rounded-full mb-1" />
                                            <div className="h-1.5 w-12 bg-white/10 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="mt-auto flex justify-between items-center bg-white/5 rounded-lg p-2 border border-white/5">
                                        <span className="text-[10px] text-muted-foreground">Match Score</span>
                                        <span className="text-xs font-bold text-primary">98%</span>
                                    </div>
                                </div>

                                {/* Floating Tag */}
                                <div className="absolute -top-4 right-8 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-bounce duration-[2000ms]">
                                    New Match!
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
