import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Send, Twitter } from "lucide-react"

function Footer() {
    return (
        <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
            <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <span className="text-lg font-bold text-white">P</span>
                            </div>
                            <span className="text-lg font-semibold text-foreground">PitchIQ</span>
                        </div>
                        <p className="mb-6 text-muted-foreground">
                            AI-powered deal intelligence platform helping founders perfect their pitch and connect with investors.
                        </p>
                        <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                    </div>
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Product</h3>
                        <nav className="space-y-2 text-sm">
                            <a href="#" className="block transition-colors hover:text-primary">
                                Features
                            </a>
                            <a href="#" className="block transition-colors hover:text-primary">
                                Pricing
                            </a>
                            <a href="#" className="block transition-colors hover:text-primary">
                                Testimonials
                            </a>
                            <a href="#" className="block transition-colors hover:text-primary">
                                Integration
                            </a>
                        </nav>
                    </div>
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Company</h3>
                        <nav className="space-y-2 text-sm">
                            <a href="#" className="block transition-colors hover:text-primary">
                                About Us
                            </a>
                            <a href="#" className="block transition-colors hover:text-primary">
                                Careers
                            </a>
                            <a href="#" className="block transition-colors hover:text-primary">
                                Blog
                            </a>
                            <a href="#" className="block transition-colors hover:text-primary">
                                Contact
                            </a>
                        </nav>
                    </div>
                    <div className="relative">
                        <h3 className="mb-4 text-lg font-semibold">Stay Connected</h3>
                        <form className="relative mb-6">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="pr-12 backdrop-blur-sm bg-background border-border"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                            >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Subscribe</span>
                            </Button>
                        </form>
                        <div className="flex space-x-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                            <Facebook className="h-4 w-4" />
                                            <span className="sr-only">Facebook</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow us on Facebook</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                            <Twitter className="h-4 w-4" />
                                            <span className="sr-only">Twitter</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow us on Twitter</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                            <Instagram className="h-4 w-4" />
                                            <span className="sr-only">Instagram</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow us on Instagram</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                            <Linkedin className="h-4 w-4" />
                                            <span className="sr-only">LinkedIn</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Connect on LinkedIn</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center text-sm text-muted-foreground md:flex-row md:text-left">
                    <p>&copy; {new Date().getFullYear()} PitchIQ. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export { Footer }
