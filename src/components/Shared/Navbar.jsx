"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Bus, User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@heroui/react";

export default function Navbar() {
    const { data: session, isPending } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    
    // UI Interaction States
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile menu automatically on navigation change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await signOut();
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        router.push("/"); 
    };

    // Determine dashboard link based on user role
    const dashboardLink = session?.user?.role === "vendor" 
        ? "/dashboard/vendor" 
        : session?.user?.role === "admin" 
        ? "/dashboard/admin" 
        : "/dashboard/user";

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Left: Logo and Mobile Toggle Button */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden transition"
                            aria-label="Toggle navigation menu"
                        >
                            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition">
                                <Bus className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-800 tracking-tight">TicketBari</span>
                        </Link>
                    </div>

                    {/* Middle: Navigation Links (Desktop Viewport Only) */}
                    <div className="hidden md:flex space-x-8">
                        <Link 
                            href="/" 
                            className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                        >
                            Home
                        </Link>
                        <Link 
                            href="/tickets" 
                            className={`text-sm font-medium transition-colors ${pathname === '/tickets' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                        >
                            All Tickets
                        </Link>
                        {session?.user && (
                            <Link 
                                href={dashboardLink} 
                                className={`text-sm font-medium transition-colors ${pathname.includes('/dashboard') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Right: Authentication Action Buttons */}
                    <div className="flex items-center gap-4">
                        {isPending ? (
                            <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
                        ) : session?.user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-slate-200 hover:bg-slate-50 transition"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
                                        {session.user.name?.charAt(0) || "U"}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[100px] truncate">
                                        {session.user.name}
                                    </span>
                                    <ChevronDown size={16} className="text-slate-400" />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-xs text-slate-500">Signed in as</p>
                                            <p className="text-sm font-bold text-slate-800 truncate">{session.user.email}</p>
                                        </div>
                                        
                                        <div className="py-1">
                                            <Link 
                                                href={dashboardLink}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
                                            >
                                                <User size={16} />
                                                My Profile
                                            </Link>
                                        </div>
                                        
                                        <div className="border-t border-slate-100 py-1">
                                            <button 
                                                onClick={handleLogout}
                                                className="flex items-center w-full gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/auth/signin" passHref>
                                    <Button variant="light" className="font-medium">
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/auth/signup" passHref>
                                    <Button color="primary" className="font-medium bg-blue-600">
                                        Register
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Mobile Dropdown Drawer Menu Component */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-4 space-y-2 shadow-inner animate-in slide-in-from-top duration-200">
                    <Link 
                        href="/" 
                        className={`block px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Home
                    </Link>
                    <Link 
                        href="/tickets" 
                        className={`block px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${pathname === '/tickets' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        All Tickets
                    </Link>
                    {session?.user && (
                        <Link 
                            href={dashboardLink} 
                            className={`block px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${pathname.includes('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Dashboard
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}