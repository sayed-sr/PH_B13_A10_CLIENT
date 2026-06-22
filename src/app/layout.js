import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Shared/Navbar";
import Footer from "@/components/Footer";

// If you have a Providers wrapper for HeroUI, make sure to import it. 
// (e.g., import { Providers } from "./providers";)

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TicketBari - Book Your Tickets",
  description: "Book bus, train, launch & flight tickets easily and securely.",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning is added so next-themes (dark mode) doesn't cause hydration errors
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        
        {/* If your app uses a <Providers> component for HeroUI, wrap these 3 lines inside <Providers> */}
        
        <Navbar />
        
        {/* The main tag expands to push the footer to the bottom if the page content is short */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />

      </body>
    </html>
  );
}