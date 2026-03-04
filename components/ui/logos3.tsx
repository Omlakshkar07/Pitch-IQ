"use client";

import AutoScroll from "embla-carousel-auto-scroll";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";

interface Logos3Props {
    heading?: string;
    className?: string;
}

const SwiftseedIcon = () => (
    <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300 transform scale-75 md:scale-100">
        <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M11 2 A 4 4 0 0 1 15 6 A 4 4 0 0 1 11 10 A 4 4 0 0 1 7 6 A 4 4 0 0 1 11 2 Z" fill="#B1FF25" transform="translate(-1, 0)" />
            <path d="M15 6 A 4 4 0 0 1 19 10 A 4 4 0 0 1 15 14 A 4 4 0 0 1 11 10 A 4 4 0 0 1 15 6 Z" fill="#B1FF25" transform="translate(0, 0)" />
            <path d="M11 10 A 4 4 0 0 1 15 14 A 4 4 0 0 1 11 18 A 4 4 0 0 1 7 14 A 4 4 0 0 1 11 10 Z" fill="#B1FF25" transform="translate(-1, 0)" />
            <path d="M7 6 A 4 4 0 0 1 11 10 A 4 4 0 0 1 7 14 A 4 4 0 0 1 3 10 A 4 4 0 0 1 7 6 Z" fill="#B1FF25" transform="translate(0, 0)" />
        </svg>
        <div className="flex flex-col justify-center">
            <span className="text-3xl font-black text-foreground leading-none tracking-wider">
                SWIFTSEED
            </span>
            <span className="text-sm font-black leading-none mt-1" style={{ color: "#B1FF25" }}>
                VENTURES
            </span>
        </div>
    </div>
);

const Logos3 = ({
    heading = "Trusted by 4,000+ Growing Companies",
}: Logos3Props) => {
    // Generate an array of 8 instances to loop exactly as before
    const placeholderItems = Array.from({ length: 8 }, (_, i) => i);

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container flex flex-col items-center text-center relative z-10">
                <h2 className="text-xl md:text-2xl font-medium text-muted-foreground mb-12">
                    {heading}
                </h2>
            </div>

            <div className="relative mx-auto flex items-center justify-center lg:max-w-7xl overflow-hidden">
                <Carousel
                    opts={{ loop: true }}
                    plugins={[AutoScroll({ playOnInit: true, speed: 1.5 }) as any]}
                    className="w-full"
                >
                    <CarouselContent className="ml-0">
                        {placeholderItems.map((_, idx) => (
                            <CarouselItem
                                key={idx}
                                className="flex basis-1/2 justify-center pl-0 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                            >
                                <div className="mx-6 flex shrink-0 items-center justify-center">
                                    <SwiftseedIcon />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>

                {/* Fade Edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
            </div>
        </section>
    );
};

export { Logos3 };
