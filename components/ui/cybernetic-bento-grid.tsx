"use client";

import { cn } from "@/lib/utils";
import {
    BarChart3,
    Gauge,
    TrendingUp,
    Target,
    Users,
    Search,
    CheckCircle2,
    Zap,
} from "lucide-react";

interface BentoGridItemProps {
    title: string;
    description: string;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

const BentoGridItem = ({
    title,
    description,
    header,
    icon,
    className,
}: BentoGridItemProps) => {
    return (
        <div
            className={cn(
                "row-span-1 group/bento hover:shadow-xl transition duration-300 shadow-none p-6 bg-black/40 border border-white/10 backdrop-blur-md flex flex-col justify-between space-y-4 rounded-3xl hover:border-primary/50 relative overflow-hidden",
                className
            )}
        >
            {/* Header / Mockup Area */}
            <div className="flex-1 w-full min-h-[10rem] rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden group-hover/bento:border-primary/20 transition-colors mb-4">
                {header}
            </div>

            {/* Content Area */}
            <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10">
                <div className="font-bold font-sans text-xl text-foreground mb-2 mt-2 group-hover/bento:text-primary transition-colors">
                    {title}
                </div>
                <div className="font-sans font-normal text-muted-foreground text-sm leading-relaxed">
                    {description}
                </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
};

export function CyberneticBentoGrid() {
    const items = [
        {
            title: "AI Pitch Deck Analyzer",
            description:
                "Get instant, objective feedback on your pitch deck across 15+ evaluation parameters without any coding skills.",
            header: (
                <div className="w-full h-full flex flex-col justify-center items-center p-6 relative">
                    <div className="absolute inset-0 bg-grid-white/[0.02]" />
                    {/* Mockup: Input Field */}
                    <div className="w-full max-w-sm bg-black/50 border border-white/10 rounded-lg p-3 flex items-center gap-3 shadow-lg group-hover/bento:border-primary/30 transition-colors">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <div className="h-2 w-24 bg-white/10 rounded-full" />
                        <div className="ml-auto bg-primary text-white text-[10px] px-2 py-1 rounded font-medium">Analyze</div>
                    </div>
                    {/* Mockup: Result Cards */}
                    <div className="mt-4 flex gap-3 w-full max-w-sm">
                        <div className="h-16 flex-1 bg-white/5 rounded-lg border border-white/5 p-2 animate-pulse space-y-2">
                            <div className="h-2 w-8 bg-primary/20 rounded-full" />
                            <div className="h-1.5 w-12 bg-white/10 rounded-full" />
                        </div>
                        <div className="h-16 flex-1 bg-white/5 rounded-lg border border-white/5 p-2 animate-pulse delay-75 space-y-2">
                            <div className="h-2 w-8 bg-green-500/20 rounded-full" />
                            <div className="h-1.5 w-12 bg-white/10 rounded-full" />
                        </div>
                        <div className="h-16 flex-1 bg-white/5 rounded-lg border border-white/5 p-2 animate-pulse delay-150 space-y-2">
                            <div className="h-2 w-8 bg-amber-500/20 rounded-full" />
                            <div className="h-1.5 w-12 bg-white/10 rounded-full" />
                        </div>
                    </div>
                </div>
            ),
            className: "md:col-span-2",
        },
        {
            title: "Investment Readiness",
            description:
                "Track your fundraising preparedness with a comprehensive 0-100 score.",
            header: (
                <div className="w-full h-full flex justify-center items-center relative">
                    <div className="absolute inset-0 bg-dot-white/[0.1]" />
                    {/* Mockup: Gauge */}
                    <div className="relative h-24 w-24 rounded-full border-4 border-white/10 flex items-center justify-center group-hover/bento:border-primary/20 transition-colors">
                        <div className="absolute top-0 right-0 w-full h-full border-t-4 border-r-4 border-primary rounded-full rotate-45" />
                        <div className="text-2xl font-bold text-white">85</div>
                    </div>
                </div>
            ),
            className: "md:col-span-1",
        },
        {
            title: "Valuation Benchmarks",
            description:
                "Access realistic valuation ranges based on actual Indian startup data.",
            header: (
                <div className="w-full h-full flex justify-center items-center relative p-6">
                    {/* Mockup: Bar Chart */}
                    <div className="w-full h-full flex items-end justify-between gap-2 max-h-20">
                        {[40, 70, 50, 90, 60].map((h, i) => (
                            <div key={i} className="w-full bg-white/10 rounded-t-sm hover:bg-primary transition-colors duration-300" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>
            ),
            className: "md:col-span-1",
        },
        {
            title: "Smart Matching",
            description:
                "Connect with investors who actually fund startups like yours.",
            header: (
                <div className="w-full h-full flex justify-center items-center relative gap-4">
                    {/* Mockup: Nodes */}
                    <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center z-10 relative">
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-primary to-transparent -translate-y-1/2 origin-left" style={{ transform: `rotate(${i * 45 - 45}deg) translateY(-50%)` }} />
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-6 w-24 bg-white/5 rounded border border-white/5 flex items-center px-2">
                                <div className="h-1.5 w-12 bg-white/20 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ),
            className: "md:col-span-1",
        },
        {
            title: "Founder Community",
            description:
                "Learn from peers, share challenges, and get feedback.",
            header: (
                <div className="w-full h-full flex justify-center items-center relative">
                    {/* Mockup: Avatar Stack */}
                    <div className="flex -space-x-4">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-10 w-10 rounded-full bg-neutral-800 border-2 border-black flex items-center justify-center text-[10px] text-white font-medium hover:scale-110 transition-transform duration-300 z-10 hover:z-20">
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}
                        <div className="h-10 w-10 rounded-full bg-primary border-2 border-black flex items-center justify-center text-white text-xs font-bold z-0 pl-1">
                            +50
                        </div>
                    </div>
                    {/* Success Badge */}
                    <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white border border-white/10 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Joined
                    </div>
                </div>
            ),
            className: "md:col-span-1",
        },
    ];

    return (
        <section className="py-24 relative px-6 bg-black/20">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight">
                        Everything You Need to Become Investment-Ready
                    </h2>
                    <p className="mt-4 font-normal text-lg text-muted-foreground max-w-2xl mx-auto">
                        AI-powered tools and community support to guide you from pitch deck to term sheet.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {items.map((item, i) => (
                        <BentoGridItem
                            key={i}
                            title={item.title}
                            description={item.description}
                            header={item.header}
                            className={item.className}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
