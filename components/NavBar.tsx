"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function NavBar() {
  const { user, loading, signOut } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-white">
            Salary<span className="text-blue-400">Split</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <a href="#tools" className="hidden sm:block text-sm text-slate-400 hover:text-blue-400 transition-colors">
            Tools
          </a>
          <a href="#how-it-works" className="hidden sm:block text-sm text-slate-400 hover:text-blue-400 transition-colors">
            How It Works
          </a>
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/compare"
                className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
              >
                Compare
              </Link>
              <Link
                href="/trip-planner"
                className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Trip Planner
              </Link>
              <Link
                href="/calculator"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
              >
                Calculator
              </Link>
              {avatarUrl && (
                <Link href="/dashboard">
                  <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full border-2 border-slate-700 hover:border-blue-500 transition-colors" />
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/compare"
                className="hidden sm:block text-sm text-slate-400 hover:text-purple-400 transition-colors"
              >
                Compare
              </Link>
              <Link
                href="/trip-planner"
                className="hidden sm:block text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Trip Planner
              </Link>
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/calculator"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/20"
              >
                Try Calculator
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
