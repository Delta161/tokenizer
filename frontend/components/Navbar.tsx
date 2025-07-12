import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

const navLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/learn", label: "Learn" },
    { href: "/community", label: "Community" },
];

export default function Navbar() {
    return (
        <header
            className="sticky top-0 z-50 bg-white/80 shadow-[0_8px_24px_-8px_rgba(60,72,100,0.18)]"
            style={{ borderBottom: "1px solid #ccd1e0", paddingBottom: "8px" }} // 8px = 0.5rem, adjust as needed
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <span className="transition group-hover:scale-105 group-hover:bg-purple-200">
                            {/* Use logo.png from public folder */}
                            <Image
                                src="/logo.png"
                                alt="Tokenizer Logo"
                                width={190}
                                height={64}
                                className="block"
                                draggable={false}
                                priority
                            />
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="flex items-center" style={{ columnGap: "50px" }}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    "px-4 py-2 rounded-md text-sm font-medium transition",
                                    "text-black hover:text-purple-700 hover:bg-purple-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                                    "no-underline"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            className="ml-4 px-4 py-2 rounded-md text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow hover:from-purple-600 hover:to-purple-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 no-underline"
                        >
                            Login
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
