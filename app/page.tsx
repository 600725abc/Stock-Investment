"use client";

import Navbar from "@/components/Navbar";
import HomeSearch from "@/components/HomeSearch";
import { TrendingUp, BarChart3, Newspaper, Globe2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/[0.3] dark:bg-slate-950 transition-colors">
      <Navbar showSearch={false} />

      <main className="flex-1 flex flex-col items-center justify-center -mt-10 px-4">
        <div className="flex flex-col items-center w-full max-w-2xl text-center">
          {/* Logo Mark */}
          <div className="mb-6 w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 dark:bg-slate-50 dark:shadow-indigo-500/10 transition-colors">
            <TrendingUp size={32} className="text-white dark:text-slate-900" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-4 dark:text-slate-50 transition-colors">
            {t("home.title")}
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-lg leading-relaxed dark:text-slate-400 transition-colors">
            {t("home.subtitle")}
          </p>

          <HomeSearch />


          {/* Features - Minimal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-24 border-t border-slate-100 pt-12 dark:border-slate-800 transition-colors">
            {[
              { icon: BarChart3, label: "home.features.charts" },
              { icon: Newspaper, label: "home.features.news" },
              { icon: Globe2, label: "home.features.global" }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4">
                <feature.icon className="text-slate-400 w-6 h-6 dark:text-slate-500" strokeWidth={1.5} />
                <span className="font-semibold text-slate-700 dark:text-slate-300 transition-colors">{t(feature.label)}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center border-t border-slate-100 bg-white dark:bg-slate-950 dark:border-slate-900 transition-colors">
        <p className="text-xs text-slate-400 font-medium dark:text-slate-600">
          &copy; {new Date().getFullYear()} {t("home.footer")}
        </p>
      </footer>
    </div>
  );
}
