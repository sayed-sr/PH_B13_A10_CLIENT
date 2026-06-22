"use client";

import { useState } from "react";
import { Card, Button, Link } from "@heroui/react";
import { Eye, EyeSlash, At, ShieldKeyhole } from "@gravity-ui/icons";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn.email({
        email: email.trim(),
        password: password,
      }, {
        onRequest: () => {
          setIsLoading(true);
        },
       onSuccess: async (ctx) => {
  const user = ctx.data?.user;

  if (user) {
    let finalRole = user.role; // Fallback

    try {
      // Send the email to backend to get a fresh token based on DB records
      const jwtResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/jwt`, {
        email: user.email,
      });

      if (jwtResponse.data?.token) {
        localStorage.setItem("token", jwtResponse.data.token);
        localStorage.setItem("access_token", jwtResponse.data.token);
        // Capture the true role verified by MongoDB
        finalRole = jwtResponse.data.role; 
      }
    } catch (jwtErr) {
      console.error("Express backend JWT handshake failed:", jwtErr);
    }

    setIsLoading(false);

    // Dynamic routing based on the fresh DB role
    if (finalRole === "admin") {
      router.push("/dashboard/admin");
    } else if (finalRole === "vendor") {
      router.push("/dashboard/vendor"); // Sends them straight to vendor dashboard!
    } else {
      router.push(redirectTo);
    }
    
    router.refresh();
  }
},
        onError: (ctx) => {
          setIsLoading(false);
          setError(ctx.error?.message || "Invalid credentials.");
        }
      });
    } catch (err) {
      setError("A critical communication error occurred.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn.social({ provider: "google", callbackURL: redirectTo });
    } catch (err) {
      console.error("Social auth error:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50/50 px-4">
      <Card className="w-full max-w-md p-8 shadow-lg border border-blue-100 rounded-2xl bg-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-2">Log in to manage your tickets.</p>
        </div>

        <form onSubmit={handleSignin} className="flex flex-col gap-5">
          
          {/* Native HTML compatible Email wrapping to eliminate DOM prop errors */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500 transition rounded-xl h-12 px-3">
              <At className="text-slate-400 shrink-0 mr-2" size={16} />
              <input
                required
                type="email"
                placeholder="hello@ticketbari.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Native HTML compatible Password wrapping to eliminate DOM prop errors */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500 transition rounded-xl h-12 px-3">
              <ShieldKeyhole className="text-slate-400 shrink-0 mr-2" size={16} />
              <input
                required
                type={isVisible ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none pr-8"
              />
              <button 
                type="button" 
                onClick={toggleVisibility} 
                className="absolute right-3 text-slate-400 hover:text-blue-500 focus:outline-none"
              >
                {isVisible ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm rounded-xl bg-red-50 text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full bg-blue-600 text-white font-bold rounded-xl h-12 hover:bg-blue-700 transition" isLoading={isLoading}>
            Log In
          </Button>
        </form>

        <div className="relative flex py-6 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold tracking-wider">OR</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <Button onPress={handleGoogleLogin} variant="bordered" className="w-full border-slate-300 font-semibold text-slate-700 rounded-xl h-12 flex items-center justify-center gap-2 hover:bg-slate-50">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </Button>

        <div className="text-center pt-6 text-sm text-slate-500">
          New to TicketBari?{" "}
          <Link href="/auth/signup" className="text-blue-600 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}