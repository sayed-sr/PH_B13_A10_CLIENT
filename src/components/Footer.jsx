"use client";

import Link from "next/link";
import { Bus } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* 4 columns on desktop, stacked on mobile layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Column 1: Logo + Short description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Bus className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">TicketBari</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Book bus, train, launch & flight tickets easily with absolute security and real-time operator availability monitoring.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-blue-400 transition">Home</Link></li>
            <li><Link href="/tickets" className="hover:text-blue-400 transition">All Tickets</Link></li>
            <li><Link href="/contact" className="hover:text-blue-400 transition">Contact Us</Link></li>
            <li><Link href="/about" className="hover:text-blue-400 transition">About Us</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact Info</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>Email: <span className="text-slate-300">support@ticketbari.com</span></li>
            <li>Phone: <span className="text-slate-300">+880 1234-567890</span></li>
            <li>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition">
                Facebook Page
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Payment Methods */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Payment Methods</h4>
          <p className="text-sm text-slate-400 mb-3">We support verified checkout routes globally:</p>
          <div className="flex items-center gap-3">
            <span className="bg-slate-800 text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-md tracking-wider border border-slate-700">
              STRIPE
            </span>
            <span className="bg-slate-800 text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-md tracking-wider border border-slate-700">
              SSLCOMMERZ
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar Requirement */}
      <div className="border-t border-slate-800/60 bg-slate-950/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 TicketBari. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}