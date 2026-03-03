"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Platform", href: "/#platform" },
    { name: "For Founders", href: "/#founders" },
    { name: "For VCs & Accelerators", href: "/#vcs" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Resources", href: "/#resources" },
]

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed left-1/2 top-6 z-50 w-[95%] max-w-7xl -translate-x-1/2 rounded-full border border-border/40 bg-background/60 px-6 py-3 shadow-md backdrop-blur-md">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <span className="text-lg font-bold text-black border-primary">P</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">PitchIQ</span>
                </Link>

                {/* Nav Links */}
                <div className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (pathname === "/" && link.href === "/");
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm transition-colors ${isActive
                                        ? "font-medium text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                        <Link href="/login">Log in</Link>
                    </Button>
                    <Button asChild className="bg-primary text-black hover:bg-primary/90 rounded-full px-6">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}
