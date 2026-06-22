"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, Button, Switch, Spinner } from "@heroui/react";
import { User, ShieldAlert, Users, Radio } from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  // Core Data Arrays
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to extract token from local storage keys accurately
  const getExpressToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("access_token");
  };

  const fetchAdminLedgers = async () => {
    setLoading(true);
    try {
      const token = getExpressToken();
      if (!token) {
        console.error("No token found in localStorage! Admin needs authorization payload credentials.");
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch tickets (Get all statuses without page limitation for full admin control desk)
      const ticketsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tickets?limit=100`, config);
      setTickets(ticketsRes.data.tickets || []);

      // 2. Fetch users using custom Express verifyToken middleware protection path
      const usersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`, config);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Express synchronization validation break:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchAdminLedgers();
    }
  }, [session, activeTab]);

  // Manage Ticket Approvals & Rejections Engine
  const handleTicketStatusChange = async (id, statusValue) => {
    try {
      const token = getExpressToken();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`, 
        { verificationStatus: statusValue }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminLedgers();
    } catch (err) {
      alert("Ticket configuration update error.");
    }
  };

  // Manage Users Privileges, Vendor States and Fraud Triggers
  const handleUserUpdate = async (id, updateBody) => {
    try {
      const token = getExpressToken();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, 
        updateBody, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminLedgers();
    } catch (err) {
      alert("Account status adjustment rejected by api authorization.");
    }
  };

  // Advertise Ticket Toggles (Max 6 limit enforced via frontend rule layout)
  const handleAdvertiseToggle = async (ticketItem) => {
    const totalAdvertised = tickets.filter(t => t.isAdvertised).length;
    const targetState = !ticketItem.isAdvertised;

    if (targetState && totalAdvertised >= 6) {
      alert("Operational constraint failure: Admin cannot advertise more than 6 tickets at a time.");
      return;
    }

    try {
      const token = getExpressToken();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketItem._id}`, 
        { isAdvertised: targetState }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminLedgers();
    } catch (err) {
      alert("Advertising status target allocation failed.");
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50/20">
        <Spinner label="Refreshing security ledger sync..." size="lg" />
      </div>
    );
  }

  const approvedTickets = tickets.filter(t => t.verificationStatus === "approved");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 min-h-[75vh]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex flex-col gap-2">
        <Button onClick={() => setActiveTab("profile")} className={`justify-start gap-3 h-12 font-semibold rounded-xl ${activeTab === "profile" ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}><User size={18} /> Admin Profile</Button>
        <Button onClick={() => setActiveTab("tickets")} className={`justify-start gap-3 h-12 font-semibold rounded-xl ${activeTab === "tickets" ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}><ShieldAlert size={18} /> Manage Tickets</Button>
        <Button onClick={() => setActiveTab("users")} className={`justify-start gap-3 h-12 font-semibold rounded-xl ${activeTab === "users" ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}><Users size={18} /> Manage Users</Button>
        <Button onClick={() => setActiveTab("advertise")} className={`justify-start gap-3 h-12 font-semibold rounded-xl ${activeTab === "advertise" ? "bg-blue-600 text-white" : "bg-transparent text-slate-600 hover:bg-slate-100"}`}><Radio size={18} /> Advertise Tickets</Button>
      </aside>

      {/* Workspace Area */}
      <main className="flex-1 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* a) Admin Profile Display */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Admin Account Configuration Data</h2>
            <div className="flex items-center gap-6 p-6 bg-slate-50 border rounded-2xl">
              <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl overflow-hidden border shadow-inner">
                {session?.user?.image ? <img src={session.user.image} className="w-full h-full object-cover" alt="" /> : <User size={32} />}
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-slate-800">{session?.user?.name || "System Controller"}</p>
                <p className="text-sm text-slate-500 font-medium">Email Context: {session?.user?.email}</p>
                <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-red-100 text-red-700">Role Authority: {session?.user?.role || "admin"}</span>
              </div>
            </div>
          </div>
        )}

        {/* b) Manage Tickets Table View Layout */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Platform Transit Ticket Directory</h2>
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-400 py-12 text-center">No operator tickets populated inside database clusters.</p>
            ) : (
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-sm border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b text-xs uppercase tracking-wider">
                      <th className="p-4">Journey / Route Details</th>
                      <th className="p-4">Operator Email</th>
                      <th className="p-4">Fare Matrix</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Moderation Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-600 font-medium">
                    {tickets.map(t => {
                      const colors = { pending: "text-amber-600 bg-amber-50", approved: "text-emerald-600 bg-emerald-50", rejected: "text-rose-600 bg-rose-50" };
                      return (
                        <tr key={t._id} className="hover:bg-slate-50/50">
                          <td className="p-4">
                            <p className="font-bold text-slate-800">{t.title}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{t.from} → {t.to} ({t.transportType})</p>
                          </td>
                          <td className="p-4 text-xs font-mono">{t.vendorEmail}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800">${t.price}</p>
                            <p className="text-[11px] text-slate-400">{t.quantity} available</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider ${colors[t.verificationStatus || "pending"]}`}>
                              {t.verificationStatus || "pending"}
                            </span>
                          </td>
                          <td className="p-4 flex justify-center gap-2">
                            <Button size="sm" onClick={() => handleTicketStatusChange(t._id, "approved")} className="bg-emerald-600 text-white font-bold rounded-lg text-xs h-8">Approve</Button>
                            <Button size="sm" variant="flat" color="danger" onClick={() => handleTicketStatusChange(t._id, "rejected")} className="font-bold rounded-lg text-xs h-8">Reject</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* c) Manage Users Dynamic Authorization Layout Matrix */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Global System Accounts Matrix</h2>
            {users.length === 0 ? (
              <p className="text-sm text-slate-400 py-12 text-center">No identity profiles found on the platform.</p>
            ) : (
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-sm border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b text-xs uppercase tracking-wider">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Role Designation</th>
                      <th className="p-4">Blacklist State</th>
                      <th className="p-4 text-center">Privilege Modifier Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-600 font-medium">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-[11px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase font-mono">{u.role}</span>
                        </td>
                        <td className="p-4">
                          {u.isFraud ? (
                            <span className="text-[10px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded uppercase tracking-wider">FRAUD BAN ACTIVE</span>
                          ) : (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-wider">CLEAN</span>
                          )}
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                          {/* Rule A: Promote anyone to admin except active admins */}
                          {u.role !== "admin" && (
                            <Button size="sm" onClick={() => handleUserUpdate(u._id, { role: "admin" })} className="bg-blue-600 text-white font-bold rounded-lg text-xs h-8">
                              Make Admin
                            </Button>
                          )}

                          {/* Rule B: FIXED - Now always shows "Approve Vendor" for normal users so you can re-promote them */}
                          {u.role === "user" && (
                            <Button size="sm" variant="flat" color="primary" onClick={() => handleUserUpdate(u._id, { role: "vendor", vendorVerification: "approved" })} className="font-bold rounded-lg text-xs h-8">
                              Approve Vendor
                            </Button>
                          )}

                          {/* Rule C: Convert an active Vendor back into a Standard User */}
                          {u.role === "vendor" && (
                            <Button size="sm" variant="flat" color="warning" onClick={() => handleUserUpdate(u._id, { role: "user", vendorVerification: "none" })} className="font-bold rounded-lg text-xs h-8">
                              Make Normal User
                            </Button>
                          )}

                          {/* Rule D: Flag approved active vendors as fraudulent profiles */}
                          {u.role === "vendor" && !u.isFraud && (
                            <Button size="sm" color="danger" onClick={() => handleUserUpdate(u._id, { isFraud: true })} className="font-bold rounded-lg text-xs h-8">
                              Mark as Fraud
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* d) Advertise Tickets Allocation Slots */}
        {activeTab === "advertise" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Home Promotion Banner Slot Assignment Matrix</h2>
                <p className="text-xs text-slate-400 mt-0.5">Approved transit entities mapped for high visibility grids.</p>
              </div>
              <div className="bg-blue-50 border text-blue-700 font-mono font-bold text-xs px-4 py-2 rounded-xl shadow-inner">
                Active Ads: {tickets.filter(t => t.isAdvertised).length} / 6 Max Limit Enforced
              </div>
            </div>

            {approvedTickets.length === 0 ? (
              <p className="text-sm text-slate-400 py-12 text-center">No verified active approved ticket frameworks found.</p>
            ) : (
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-sm border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b text-xs uppercase tracking-wider">
                      <th className="p-4">Ticket Name / Details</th>
                      <th className="p-4">Base Fair Cost</th>
                      <th className="p-4">Transit Modality</th>
                      <th className="p-4 text-center">Broadcast Banner Selector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-600 font-medium">
                    {approvedTickets.map(t => (
                      <tr key={t._id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{t.title}</p>
                          <p className="text-xs text-slate-400">{t.from} to {t.to}</p>
                        </td>
                        <td className="p-4 font-bold text-slate-800">${t.price}.00</td>
                        <td className="p-4 text-xs font-semibold text-blue-600 uppercase tracking-wide">{t.transportType}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center justify-center">
                            <Switch isSelected={t.isAdvertised || false} onChange={() => handleAdvertiseToggle(t)} size="sm" color="success" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}