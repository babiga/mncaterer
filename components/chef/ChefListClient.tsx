"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChefCard } from "./ChefCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, SlidersHorizontal, ChevronLeft, ChevronRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Link, useRouter, usePathname } from "@/i18n/routing";

interface ChefListClientProps {
  initialChefs: any[];
  totalCount: number;
}

export function ChefListClient({ initialChefs, totalCount }: ChefListClientProps) {
  const t = useTranslations("Chefs");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [chefs, setChefs] = useState(initialChefs);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(totalCount);

  // Get initial values from URL
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "");
  const [minExperience, setMinExperience] = useState(searchParams.get("minExperience") || "");
  const [showFilters, setShowFilters] = useState(
    !!(searchParams.get("search") || searchParams.get("specialty") || searchParams.get("minExperience"))
  );

  const [totalPages, setTotalPages] = useState(Math.ceil(totalCount / 12));

  const updateUrl = useCallback((updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!updates.page && updates.page !== undefined) {
      params.delete("page");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const fetchChefs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chefs?${searchParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        setChefs(result.data);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch chefs:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(Number(searchParams.get("page")) || 1);
    setSearch(searchParams.get("search") || "");
    setSpecialty(searchParams.get("specialty") || "");
    setMinExperience(searchParams.get("minExperience") || "");

    fetchChefs();
  }, [searchParams, fetchChefs]);

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUrlSearch = searchParams.get("search") || "";
      if (search !== currentUrlSearch) {
        updateUrl({ search });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, updateUrl, searchParams]);

  const handleClearFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-serif text-white mb-4"
          >
            {t("seeAllTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg md:text-xl font-light leading-relaxed"
          >
            {t("seeAllDescription")}
          </motion.p>
        </div>

        <Button
          asChild
          className="bg-primary text-black hover:bg-primary/90 gap-2 md:hidden"
        >
          <Link href="/signup?tab=chef">{t("registerAsChef")}</Link>
        </Button>

        <div className="flex items-center justify-between gap-4">
          <div className="text-white/40 text-sm uppercase tracking-widest text-right">
            {t("stats.results", { count: total })}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`border-white/10 hover:border-primary/50 text-white gap-2 transition-all ${showFilters ? 'bg-white/10' : 'bg-transparent'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t("filters.title")}
          </Button>

          <Button
            asChild
            className="bg-primary text-black hover:bg-primary/90 gap-2 hidden md:flex"
          >
            <Link href="/signup?tab=chef">{t("registerAsChef")}</Link>
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/40">{t("filters.search")}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("filters.search")}
                    className="bg-white/5 border-white/10 pl-10 h-12 focus:border-primary/50 transition-all rounded-xl"
                  />
                </div>
              </div>

              {/* Specialty */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/40">{t("filters.specialty")}</label>
                <div className="relative">
                  <Input
                    value={specialty}
                    onChange={(e) => {
                      setSpecialty(e.target.value);
                      updateUrl({ specialty: e.target.value });
                    }}
                    placeholder={t("filters.allSpecialties")}
                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/40">{t("filters.minExperience")}</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={minExperience}
                    onChange={(e) => updateUrl({ minExperience: e.target.value })}
                    placeholder={t("filters.years")}
                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="grow h-12 p-0 hover:bg-white/10 border border-white/5 rounded-xl text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5 mr-2" />
                  {t("filters.clear")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Section */}
      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        )}

        {chefs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {chefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-2xl font-light text-white">No chefs found</h3>
            <p className="text-white/40 max-w-sm">Try adjusting your filters or search terms to find the perfect chef for your event.</p>
            <Button variant="link" onClick={handleClearFilters} className="text-primary hover:text-white">
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 pt-12 border-t border-white/5">
          <Button
            variant="ghost"
            disabled={page === 1}
            onClick={() => updateUrl({ page: (page - 1).toString() })}
            className="text-white/40 hover:text-white hover:bg-white/5 w-12 h-12 p-0 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => updateUrl({ page: (i + 1).toString() })}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${page === i + 1 ? 'w-8 bg-primary' : 'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            disabled={page === totalPages}
            onClick={() => updateUrl({ page: (page + 1).toString() })}
            className="text-white/40 hover:text-white hover:bg-white/5 w-12 h-12 p-0 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
