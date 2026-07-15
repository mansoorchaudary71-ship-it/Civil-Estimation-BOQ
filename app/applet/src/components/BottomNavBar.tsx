import React, { useState, useEffect } from "react";
import { Home, Clock, Save, Share2, User } from "lucide-react";
import toast from "react-hot-toast";

export default function BottomNavBar({
  activeModule,
  onNavigate,
  onOpenProfile,
  onOpenHistory,
}: {
  activeModule: string;
  onNavigate: (module: string) => void;
  onOpenProfile: () => void;
  onOpenHistory: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Do NOT appear on the home/landing page or other non-tool static pages
  const isStaticPage = [
    "home",
    "about",
    "careers",
    "contact",
    "blog",
    "pricing",
    "privacy",
    "terms",
    "cookies",
  ].includes(activeModule || "home");

  if (isStaticPage) {
    return null;
  }

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem("saved_results") || "[]");
    
    // Attempt to read result if possible, or just save generic message
    const resultElement = document.getElementById("estimation-result");
    const resultText = resultElement ? resultElement.innerText : "Result saved successfully";

    if (!resultElement) {
        toast("Nothing specific to save yet, but page bookmarked!", { icon: "ℹ️" });
    } else {
        toast.success("Result saved ✓");
    }

    const newSaved = [
      {
        toolName: activeModule,
        result: resultText,
        timestamp: new Date().toISOString(),
      },
      ...saved,
    ].slice(0, 50); // Keep last 50

    localStorage.setItem("saved_results", JSON.stringify(newSaved));
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title || "Civil Estimation Pro";
    
    const resultElement = document.getElementById("estimation-result");
    const resultText = resultElement ? resultElement.innerText : "Check out this civil engineering calculation.";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: resultText,
          url,
        });
        return;
      } catch (err) {
        console.log("Share aborted:", err);
      }
    }
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const navItems = [
    { id: "home", icon: Home, label: "Home", action: () => onNavigate("home") },
    { id: "history", icon: Clock, label: "History", action: onOpenHistory },
    { id: "save", icon: Save, label: "Save", action: handleSave },
    { id: "share", icon: Share2, label: "Share", action: handleShare },
    { id: "profile", icon: User, label: "Profile", action: onOpenProfile },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-slate-200 md:hidden flex justify-around items-center pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] h-[65px]"
    >
      {navItems.map((item) => {
        const isActive = activeModule === item.id;
        
        return (
          <button
            key={item.id}
            onClick={item.action}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 p-1 transition-colors ${
              isActive ? "text-[#F26B1D]" : "text-[#6B7280]"
            } hover:bg-slate-50`}
          >
            <item.icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
