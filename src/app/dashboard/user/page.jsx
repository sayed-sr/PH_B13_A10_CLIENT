"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, Button, Input, Spinner } from "@heroui/react";
import { useSession } from "@/lib/auth-client";
import { User, Ticket, CreditCard, MapPin, Clock, ArrowRight, Trash2, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function UserDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile"); 
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const paymentProcessedRef = useRef(false);

  
  const fetchBookings = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bookings?userEmail=${session.user.email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error collecting booking datasets:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  
  useEffect(() => {
    const handleUrlPaymentVerification = async () => {
      if (typeof window === "undefined" || paymentProcessedRef.current) return;

      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get("payment_success");
      const bookingId = params.get("bookingId");
      const ticketId = params.get("ticketId");
      const quantity = params.get("qty");
      const sessionId = params.get("session_id");

      
      if (isSuccess === "true" && bookingId && sessionId) {
        paymentProcessedRef.current = true; // Prevents double processing in React Strict Mode
        setVerifyingPayment(true);
        setActiveTab("bookings"); 

        try {
          const token = localStorage.getItem("token") || localStorage.getItem("access_token");
          
          
          const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/verify-payment`, {
            bookingId,
            ticketId,
            quantity,
            sessionId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data?.success || res.data?.message === "Already processed") {
            alert("Payment Verified Successfully! Your seat booking is confirmed.");
          }
        } catch (error) {
          console.error("Stripe verification sync error:", error);
          alert("Payment went through, but we couldn't sync the transaction history. Please refresh.");
        } finally {
          setVerifyingPayment(false);
        
          window.history.replaceState({}, document.title, window.location.pathname);
          fetchBookings();
        }
      }
    };

    if (session?.user?.email) {
      handleUrlPaymentVerification();
    }
  }, [session, fetchBookings]);

  useEffect(() => {
    if (activeTab === "bookings" || activeTab === "history") {
      fetchBookings();
    }
  }, [activeTab, fetchBookings]);

  // Handle Booking Deletion
  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this pending booking request?")) return;
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel your reservation request.");
    }
  };

  
  const handlePaymentRedirect = async (booking) => {
    try {
      
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const ticketsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
  
      const liveTicket = ticketsRes.data?.tickets?.find(t => t._id === booking.ticketId);
      const requestedQty = parseInt(booking.quantity) || 1;

  
      if (liveTicket && liveTicket.quantity < requestedQty) {
        alert(`Booking failed. There are only ${liveTicket.quantity} seats remaining for this trip, but you requested ${requestedQty}. Please cancel this booking request and reserve a valid amount of seats.`);
        return;
      }

   
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ""}/create-checkout-session`, {
        bookingId: booking._id,
        title: booking.title,
        totalPrice: parseFloat(booking.totalPrice), 
        quantity: requestedQty,
        userEmail: session?.user?.email || booking.userEmail,
        ticketId: booking.ticketId 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        alert("Payment window generation failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment failure setup context:", err);
      alert(err.response?.data?.message || "Payment window generation failed. Please try again.");
    }
  };
  const paidTransactions = bookings.filter(b => b.status === "paid");

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
   
      <div className="w-64 bg-white border-r border-slate-200 p-6 space-y-6 flex flex-col">
        <div>
          <h2 className="text-xl font-black text-blue-600 tracking-tight">TicketBari</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">User Workspace</p>
        </div>

        <nav className="space-y-1 flex-grow">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === "profile" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <User size={18} /> User Profile
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === "bookings" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Ticket size={18} /> My Booked Tickets
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === "history" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <CreditCard size={18} /> Transaction History
          </button>
        </nav>
      </div>

  
      <div className="flex-1 p-10 max-w-7xl mx-auto space-y-6">
        
        {verifyingPayment && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold animate-pulse">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Verifying transaction status with internal database... Please wait.</span>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Personal Profile Details</h1>
              <p className="text-xs text-slate-400 mt-0.5">Secure system identity configurations.</p>
            </div>
            <Card className="p-8 max-w-2xl bg-white border border-slate-100 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden border">
                  {session?.user?.image ? (
                    <img src={session.user.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <User size={28} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{session?.user?.name || "Passenger Client"}</h3>
                  <p className="text-xs text-slate-400 capitalize">System Authorization Level: {session?.user?.role || "user"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Identity Signature" value={session?.user?.name || ""} readOnly variant="bordered" radius="xl" />
                <Input label="Email Route Location" value={session?.user?.email || ""} readOnly variant="bordered" radius="xl" />
              </div>
            </Card>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">My Booked Tickets</h1>
              <p className="text-xs text-slate-400 mt-0.5">Track journey processing queues and ticket reservations.</p>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center"><Spinner label="Syncing Passenger Manifest..." /></div>
            ) : bookings.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-medium">You haven't requested any tickets yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((b) => (
                  <BookingCard key={b._id} booking={b} onPay={handlePaymentRedirect} onDelete={handleCancelBooking} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Transaction History</h1>
              <p className="text-xs text-slate-400 mt-0.5">Verified Stripe secure payment records tracker.</p>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center"><Spinner /></div>
            ) : paidTransactions.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 shadow-sm">No confirmed transactions match your profile parameters.</div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 bg-white rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                      <th className="p-4 pl-6">Transaction ID</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Ticket Title</th>
                      <th className="p-4 pr-6">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paidTransactions.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 pl-6 font-mono text-xs text-slate-500">
                          {b.transactionId || `ch_${b._id.slice(0, 12)}`}
                        </td>
                        <td className="p-4 font-bold text-green-600">
                          ${b.totalPrice}
                        </td>
                        <td className="p-4 font-semibold">
                          {b.title}
                        </td>
                        <td className="p-4 pr-6 text-slate-500 text-xs">
                          {b.paymentDate ? new Date(b.paymentDate).toLocaleDateString() : new Date(b.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, onPay, onDelete }) {
  const [countdown, setCountdown] = useState("");
  const [expired, setExpired] = useState(false);





  useEffect(() => {
    if (booking.status === "rejected" || booking.status === "paid") {
      setCountdown("");
      return;
    }





    const timer = setInterval(() => {
      const departure = new Date(booking.departureTime).getTime();
      const now = new Date().getTime();
      const diff = departure - now;

      if (diff <= 0) {
        setCountdown("Trip Expired");
        setExpired(true);
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`${days}d ${hours}h ${mins}m left`);
      }
    }, 1000);



    return () => clearInterval(timer);
  }, [booking]);

  const statusColors = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-blue-50 text-blue-700 border-blue-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    paid: "bg-green-50 text-green-700 border-green-200"
  };




  return (
    <Card className="flex flex-col h-full border border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
      <div className="h-40 bg-slate-100 relative">
        <img src={booking.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600"} className="w-full h-full object-cover" alt="" />
        <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${statusColors[booking.status || "pending"]}`}>
          {booking.status === "paid" ? "Booking Confirmed" : booking.status}
        </span>
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 line-clamp-1">{booking.title}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
            <MapPin size={12} />
            <span>{booking.from}</span>
            <ArrowRight size={10} />
            <span>{booking.to}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Departure: {new Date(booking.departureTime).toLocaleString()}</p>
        </div>





        <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Reserved Slots:</span>
            <strong className="text-slate-700">{booking.quantity} seats</strong>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400">Total Price Aggregation:</span>
            <p className="text-base font-bold text-blue-600">${booking.totalPrice}</p>
          </div>





          {booking.status !== "rejected" && booking.status !== "paid" && countdown && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100 mt-1">
              <Clock size={12} />
              <span>{countdown}</span>
            </div>
          )}

          {booking.status === "pending" && (
            <Button
              onClick={() => onDelete(booking._id)}
              className="w-full font-bold h-10 rounded-xl mt-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} /> Cancel Request
            </Button>
          )}

          {booking.status === "accepted" && !expired && (
            <Button
              onClick={() => onPay(booking)}
              className="w-full bg-blue-600 text-white font-bold h-10 rounded-xl mt-2 shadow-sm hover:bg-blue-700 flex items-center justify-center"
            >
              Pay Now via Stripe
            </Button>
          )}

          {booking.status === "paid" && (
            <div className="w-full h-10 rounded-xl mt-2 bg-green-50 text-green-700 font-bold border border-green-200 flex items-center justify-center gap-2 text-xs">
              <CheckCircle2 size={14} /> Confirmed & Paid
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}