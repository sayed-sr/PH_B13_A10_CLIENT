"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";
import axios from "axios";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("Verifying payment transaction status...");
  const processedRef = useRef(false);

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    const sessionId = searchParams.get("session_id");

    if (!bookingId) {
      
      setStatusMessage("Invalid parameters. Redirecting back to workspace...");
      setTimeout(() => router.push("/dashboard/user"), 3000);
      return;
    }

    
    if (processedRef.current) return;
    processedRef.current = true;

    const finalizeBookingPayment = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        
       
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
          status: "paid",
          transactionId: sessionId || `ch_${Math.random().toString(36).substr(2, 9)}`,

          paymentDate: new Date().toISOString()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStatusMessage("Payment Confirmed! Updating your workspace manifest...");
        

        setTimeout(() => {
          router.push("/dashboard/user"); 
        }, 2000);



      } catch (err) {
        console.error("Backend state correction fault:", err);
        setStatusMessage("Sync error, but payment went through. Returning to panel...");
        setTimeout(() => router.push("/dashboard/user"), 3000);
      }
    };

    finalizeBookingPayment();
  }, [searchParams, router]);

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
     <CheckCircle2 size={40} />
     </div>
      <h1 className="text-xl font-black text-slate-800">Processing Payment</h1>
   <p className="text-sm font-semibold text-slate-500">{statusMessage}</p>
      <div className="pt-2 flex justify-center">
        <Spinner size="sm" />
      </div>
    </div>
  );
}


export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
          <p className="text-sm font-semibold text-slate-500 animate-pulse">
         Initializing verification engines...
    </p>
     <div className="pt-2 flex justify-center">
       <Spinner size="sm" />
          </div>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}