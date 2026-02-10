"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface Testimonial {
    text: string;
    image: string;
    name: string;
    role: string;
}

const testimonials: Testimonial[] = [
    {
        text: "PitchIQ gave us the brutal honesty we needed before facing investors. We fixed our revenue slide and raised $2M.",
        image: "https://avatar.vercel.sh/jenny",
        name: "Jenny Wilson",
        role: "Founder, TechFlow (Series A)",
    },
    {
        text: "The valuation benchmarks were an eye-opener. We stopped undervaluing ourselves and negotiated a fair term sheet.",
        image: "https://avatar.vercel.sh/robert",
        name: "Robert Fox",
        role: "CEO, AgriSmart",
    },
    {
        text: "I was spending weeks looking for the right VCs. PitchIQ matched me with 3 interested investors in 48 hours.",
        image: "https://avatar.vercel.sh/kristin",
        name: "Kristin Watson",
        role: "Founder, EcoWare",
    },
    {
        text: "The AI analyzer specifically pointed out our weak GTM strategy. We iterated, and the difference in investor meetings was night and day.",
        image: "https://avatar.vercel.sh/cameron",
        name: "Cameron Williamson",
        role: "Co-Founder, DataMesh",
    },
    {
        text: "Finally, a platform that understands the Indian startup ecosystem. The benchmarking data is actually relevant.",
        image: "https://avatar.vercel.sh/ester",
        name: "Ester Howard",
        role: "Angel Investor",
    },
    {
        text: "As an accelerator, we use PitchIQ to screen applications. It saves us hours and highlights the most promising founders.",
        image: "https://avatar.vercel.sh/ralph",
        name: "Ralph Edwards",
        role: "Partner, seedX",
    },
];

const TestimonialsColumn = ({
    className,
    testimonials,
    duration = 10,
}: {
    className?: string;
    testimonials: Testimonial[];
    duration?: number;
}) => {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <div
                className="flex flex-col gap-6 animate-marquee-vertical"
                style={{
                    animationDuration: `${duration}s`,
                }}
            >
                {[...new Array(2)].map((_, i) => (
                    <React.Fragment key={i}>
                        {testimonials.map(({ text, image, name, role }, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-lg hover:border-primary/30 transition-colors"
                            >
                                <div className="text-muted-foreground leading-relaxed mb-6">
                                    &quot;{text}&quot;
                                </div>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={image}
                                        alt={name}
                                        className="h-10 w-10 rounded-full border border-white/10"
                                    />
                                    <div className="flex flex-col">
                                        <div className="font-semibold text-foreground text-sm tracking-tight">{name}</div>
                                        <div className="text-xs text-muted-foreground tracking-tight">{role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export function TestimonialsSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight">
                        What Our Users Say
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join hundreds of founders who have successfully raised capital with PitchIQ.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[600px] overflow-hidden relative mask-gradient-y">
                    {/* Gradient Masks for Smooth Fade */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />

                    <TestimonialsColumn
                        testimonials={[testimonials[0], testimonials[1], testimonials[2]]}
                        duration={15}
                    />
                    <TestimonialsColumn
                        testimonials={[testimonials[3], testimonials[4], testimonials[5]]}
                        className="hidden md:flex"
                        duration={18}
                    />
                    <TestimonialsColumn
                        testimonials={[testimonials[0], testimonials[5], testimonials[1]]}
                        className="hidden lg:flex"
                        duration={12}
                    />
                </div>
            </div>
        </section>
    );
}
