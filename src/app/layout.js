import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Shared/Navbar";
import Footer from "@/components/Footer";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TicketBari - Book Your Tickets",
  description: "Book bus, train, launch & flight tickets easily and securely.",
};

export default function RootLayout({ children }) {
  return (
    
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        
        
        <Navbar />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />

      </body>
    </html>
  );
}