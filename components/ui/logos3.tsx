"use client";

import AutoScroll from "embla-carousel-auto-scroll";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";

interface Logo {
    id: string;
    description: string;
    image: string;
    className?: string;
}

interface Logos3Props {
    heading?: string;
    logos?: Logo[];
    className?: string;
}

const Logos3 = ({
    heading = "Trusted by 4,000+ Growing Companies",
    logos = [
        {
            id: "logo-1",
            description: "Spotify",
            image: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg",
            className: "h-8 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity",
        },
        {
            id: "logo-2",
            description: "Coinbase",
            image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase_Wordmark.svg",
            className: "h-6 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity",
        },
        {
            id: "logo-3",
            description: "Slack",
            image: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
            className: "h-8 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity",
        },
        {
            id: "logo-4",
            description: "Dropbox",
            image: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg",
            className: "h-8 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity",
        },
        {
            id: "logo-5",
            description: "Zoom",
            image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom.us_logo.svg",
            className: "h-6 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity",
        },
        {
            id: "logo-6",
            description: "Webflow",
            image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Webflow_logo.svg",
            className: "h-6 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity",
        },
        {
            id: "logo-7",
            description: "Stripe",
            image: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
            className: "h-8 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity",
        },
        {
            id: "logo-8",
            description: "Airbnb",
            image: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg",
            className: "h-8 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity",
        },
    ],
}: Logos3Props) => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container flex flex-col items-center text-center relative z-10">
                <h2 className="text-xl md:text-2xl font-medium text-muted-foreground mb-12">
                    {heading}
                </h2>
            </div>

            <div className="relative mx-auto flex items-center justify-center lg:max-w-7xl">
                <Carousel
                    opts={{ loop: true }}
                    plugins={[AutoScroll({ playOnInit: true, speed: 1.5 }) as any]}
                    className="w-full"
                >
                    <CarouselContent className="ml-0">
                        {logos.map((logo) => (
                            <CarouselItem
                                key={logo.id}
                                className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                            >
                                <div className="mx-6 flex shrink-0 items-center justify-center">
                                    <img
                                        src={logo.image}
                                        alt={logo.description}
                                        className={logo.className}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>

                {/* Fade Edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
            </div>
        </section>
    );
};

export { Logos3 };
