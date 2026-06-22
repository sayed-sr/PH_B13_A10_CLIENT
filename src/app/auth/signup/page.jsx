"use client";

import { useState } from "react";
import { Card, Button, Link, Input, RadioGroup, Radio } from "@heroui/react";
import { User, AtSign, Lock } from "lucide-react"; 
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSelection, setRoleSelection] = useState("user"); // 'user' = Passenger, 'vendor' = Bus Vendor
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);

      try {
          // 1. BetterAuth user initialization
          const { data, error: authError } = await signUp.email({
              email,
              password,
              name,
              callbackURL: "/"
          });

          if (authError) {
              setError(authError.message || "Registration failed.");
              setIsLoading(false);
              return;
          }

          // 2. Sync account data immediately to Express Server + MongoDB Atlas
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
              name,
              email,
              requestedRole: roleSelection // Sends 'user' or 'vendor' directly to match DB requirements
          });

          // 3. Clear state and redirect to index home page
          router.push("/");
          router.refresh();
      } catch (err) {
          console.error(err);
          setError("An unexpected error occurred during database sync.");
      } finally {
          setIsLoading(false);
      }
  };

  return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50/50 px-4 py-12">
          <Card className="w-full max-w-md p-8 shadow-lg border border-blue-100 rounded-2xl bg-white">
              <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
                  <p className="text-sm text-slate-500 mt-2">Join TicketBari to book or host transit tickets.</p>
              </div>

              <form onSubmit={handleSignup} className="flex flex-col gap-5">
                  {/* Name Input */}
                  <Input
                      isRequired
                      type="text"
                      label="Full Name"
                      labelPlacement="outside"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      variant="bordered"
                      radius="xl"
                      size="lg"
                      startContent={<User className="text-slate-400 shrink-0" size={16} />}
                      classNames={{
                          label: "text-sm font-semibold text-slate-700",
                          inputWrapper: "bg-slate-50 border-slate-200 focus-within:border-blue-500 transition"
                      }}
                  />

                  {/* Email Input */}
                  <Input
                      isRequired
                      type="email"
                      label="Email Address"
                      labelPlacement="outside"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      variant="bordered"
                      radius="xl"
                      size="lg"
                      startContent={<AtSign className="text-slate-400 shrink-0" size={16} />}
                      classNames={{
                          label: "text-sm font-semibold text-slate-700",
                          inputWrapper: "bg-slate-50 border-slate-200 focus-within:border-blue-500 transition"
                      }}
                  />

                  {/* Password Input */}
                  <Input
                      isRequired
                      type="password"
                      label="Password"
                      labelPlacement="outside"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      variant="bordered"
                      radius="xl"
                      size="lg"
                      startContent={<Lock className="text-slate-400 shrink-0" size={16} />}
                      classNames={{
                          label: "text-sm font-semibold text-slate-700",
                          inputWrapper: "bg-slate-50 border-slate-200 focus-within:border-blue-500 transition"
                      }}
                  />

                  {/* Account Type Selector via Explicit Semantic Labels */}
                  <RadioGroup
                      label="Account Type"
                      value={roleSelection}
                      classNames={{ label: "text-sm font-semibold text-slate-700 mb-1" }}
                  >
                      <div className="grid grid-cols-2 gap-3 mt-1">
                          {/* Passenger Selection Block */}
                          <label 
                              onClick={() => setRoleSelection("user")}
                              className={`flex items-center justify-between m-0 cursor-pointer rounded-xl gap-2 p-3 border transition ${
                                  roleSelection === "user" 
                                      ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500" 
                                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                              }`}
                          >
                              <span className="text-sm font-medium text-slate-700">Passenger</span>
                              <Radio value="user" isSelected={roleSelection === "user"} onChange={() => setRoleSelection("user")} />
                          </label>

                          {/* Bus Vendor Selection Block */}
                          <label 
                              onClick={() => setRoleSelection("vendor")}
                              className={`flex items-center justify-between m-0 cursor-pointer rounded-xl gap-2 p-3 border transition ${
                                  roleSelection === "vendor" 
                                      ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500" 
                                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                              }`}
                          >
                              <span className="text-sm font-medium text-slate-700">Vendor</span>
                              <Radio value="vendor" isSelected={roleSelection === "vendor"} onChange={() => setRoleSelection("vendor")} />
                          </label>
                      </div>
                  </RadioGroup>

                  {error && (
                      <div className="p-3 text-sm rounded-xl bg-red-50 text-red-600 border border-red-100">
                          {error}
                      </div>
                  )}

                  <Button 
                      type="submit" 
                      className="w-full bg-blue-600 text-white font-bold rounded-xl h-12 hover:bg-blue-700 transition mt-2" 
                      isLoading={isLoading}
                  >
                      Register Account
                  </Button>
              </form>

              <div className="text-center pt-6 text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-blue-600 font-semibold hover:underline">
                      Log In
                  </Link>
              </div>
          </Card>
      </div>
  );
}