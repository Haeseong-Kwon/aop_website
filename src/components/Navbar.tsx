"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const { scrollY } = useScroll();

    const backgroundColor = useTransform(
        scrollY,
        [0, 100],
        ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.95)"]
    );

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuItems = [
        { name: "About", href: "#hero" },
        { name: "Ventures", href: "#services" },
        { name: "Portfolio", href: "#portfolio" },
        { name: "Contact", href: "#contact" },
    ];

    return (
        <>
            <motion.nav
                style={{ backgroundColor: isOpen ? "transparent" : backgroundColor }}
                className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-5 md:px-10 transition-all duration-300 border-b border-white/10"
            >
                <div className="flex items-center">
                    <Link
                        href="/"
                        className="text-xl md:text-2xl font-black tracking-tighter text-white z-[110]"
                        onClick={() => setIsOpen(false)}
                    >
                        AOP
                    </Link>
                </div>

                <button
                    onClick={toggleMenu}
                    className="p-1.5 text-white hover:opacity-70 transition-opacity z-[110]"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
                </button>
            </motion.nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[90] bg-black flex flex-col items-center justify-center p-6 md:p-10"
                    >
                        <div className="flex flex-col items-center gap-6">
                            {menuItems.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={toggleMenu}
                                        className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white hover:text-neutral-500 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute bottom-8 flex flex-col items-center gap-3 text-neutral-500"
                        >
                            <p className="text-[10px] uppercase tracking-[0.3em] font-black">The Art of Programming</p>
                            <div className="flex gap-6 text-sm">
                                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                                <a href="#" className="hover:text-white transition-colors">Instagram</a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
