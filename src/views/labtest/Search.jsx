import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import TestCard from "./TestCard";
import api from "../../services/api";

export default function Search() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(
    params.get("category") || "all",
  );
  const [activeTier, setActiveTier] = useState("all");
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
  try {
    const res = await api.get(
      "/patient/lab/categories"
    );

    setCategories(res.data.data || []);
  } catch (error) {
    console.log(error);
  }
};


const fetchTests = async () => {
  try {
    setLoading(true);

    const params = {};

    if (query) params.search = query;
    if (activeCategory !== "all")
      params.category = activeCategory;
    if (activeTier !== "all")
      params.tier = activeTier;

    const res = await api.get(
      "/patient/lab/tests",
      { params }
    );

    setTests(res.data.data || []);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchCategories();
}, []);

useEffect(() => {
  fetchTests();
}, [query, activeCategory, activeTier]);


  const tierOptions = [
    { id: "all", label: "All Tiers" },
    { id: "essential", label: "✦ Essential" },
    { id: "advanced", label: "✦✦ Advanced" },
    { id: "premium", label: "✦✦✦ Premium" },
  ];

  if (loading) {
  return (
    <div className="text-center py-20">
      Loading...
    </div>
  );
}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6   ">
      <div className="mb-5 sm:mb-6 ">
        <h1 className="font-display font-bold text-[#0F172A] text-xl sm:text-2xl ">
          Book a Test or Package
        </h1>
        <p className="text-[#64748B] text-xs sm:text-sm mt-1">
          Browse from our full catalog of diagnostics
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5 sm:mb-6 w-full sm:max-w-2xl">
        <SearchIcon
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tests, packages or conditions…"
          className="w-full bg-white border-2 border-[#E2E8F0] rounded-2xl py-3 sm:py-3.5 pl-11 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] shadow-sm"
        />
      </div>

      {/* Category filter */}
      <div className="mb-3">
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2">
          Category
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 text-xs sm:text-sm font-semibold rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border-2 transition ${
              activeCategory === "all"
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 text-xs sm:text-sm font-semibold rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border-2 transition whitespace-nowrap ${
                activeCategory === c.id
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
             {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tier filter */}
      <div className="mb-5 sm:mb-6">
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2">
          Price Tier
        </p>
        <div className="flex gap-2 flex-wrap">
          {tierOptions.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTier(t.id)}
              className={`text-xs sm:text-sm font-semibold rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border-2 transition ${
                activeTier === t.id
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#0F172A] hover:text-[#0F172A]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#64748B] mb-4 font-medium">
       {tests.length} result{tests.length !== 1 ? "s" : ""} found
      </p>

      {tests.length === 0 ? (
        <div className="text-center py-14 sm:py-20">
          <div className="text-4xl sm:text-5xl mb-4">🔍</div>
          <p className="font-display font-semibold text-[#0F172A] text-base sm:text-lg">
            No tests found
          </p>
          <p className="text-[#64748B] text-xs sm:text-sm mt-1">
            Try a different keyword or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tests.map((item) => (
            <TestCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
