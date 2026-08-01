import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function LabTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const filteredTests = tests.filter((test) =>
    (test.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/lab/tests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTests(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/admin/lab/tests/${id}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchTests();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A]">
            Lab Tests
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage all available lab tests and their status
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64 lg:w-80">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search test..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#E2E8F0] bg-white pl-9 pr-3 py-2.5 rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
            />
          </div>

          <Link
            to="/admin/add-lab-test"
            className="inline-flex items-center justify-center gap-1.5 bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-medium text-center whitespace-nowrap hover:bg-[#1D4ED8] transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Test
          </Link>
        </div>
      </div>

      {/* Desktop / tablet table — hidden on mobile */}
      <div className="hidden md:block bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  ID
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Name
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Category
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Price
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Tier
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Status
                </th>
                <th className="p-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t border-[#E2E8F0]">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 w-full max-w-[100px] bg-[#E2E8F0] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]">
                        <svg
                          className="h-6 w-6 text-[#2563EB]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-[#0F172A]">
                        No tests found
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Try a different search keyword
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr
                    key={test.id}
                    className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="p-4 text-sm text-[#64748B]">{test.id}</td>
                    <td className="p-4 text-sm font-semibold text-[#0F172A]">
                      {test.name}
                    </td>
                    <td className="p-4 text-sm text-[#64748B]">
                      {test.category_name}
                    </td>
                    <td className="p-4 text-sm font-medium text-[#0F172A]">
                      ₹{test.price}
                    </td>
                    <td className="p-4 text-sm text-[#64748B] capitalize">
                      {test.tier}
                    </td>
                    <td className="p-4">
                      {test.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#22C55E]/10 text-[#22C55E]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EF4444]/10 text-[#EF4444]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/edit-lab-test/${test.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleStatus(test.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${
                            test.is_active
                              ? "bg-[#EF4444] hover:bg-[#dc2626]"
                              : "bg-[#14B8A6] hover:bg-[#0F766E]"
                          }`}
                        >
                          {test.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards — hidden on md and up */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 animate-pulse space-y-3"
            >
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-[#E2E8F0] rounded" />
                  <div className="h-3 w-1/4 bg-[#E2E8F0] rounded" />
                </div>
                <div className="h-6 w-16 bg-[#E2E8F0] rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-[#E2E8F0] rounded" />
                <div className="h-8 bg-[#E2E8F0] rounded" />
                <div className="h-8 bg-[#E2E8F0] rounded" />
              </div>
            </div>
          ))
        ) : filteredTests.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF]">
              <svg
                className="h-6 w-6 text-[#2563EB]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#0F172A]">No tests found</p>
            <p className="text-xs text-[#64748B] mt-1">
              Try a different search keyword
            </p>
          </div>
        ) : (
          filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#0F172A] text-sm sm:text-base truncate">
                    {test.name}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">ID: {test.id}</p>
                </div>

                {test.is_active ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#22C55E]/10 text-[#22C55E] shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EF4444]/10 text-[#EF4444] shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                    Inactive
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm mb-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3">
                <div>
                  <p className="text-[#64748B] text-xs">Category</p>
                  <p className="font-medium text-[#0F172A] text-sm truncate">
                    {test.category_name}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B] text-xs">Price</p>
                  <p className="font-medium text-[#0F172A] text-sm">
                    ₹{test.price}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B] text-xs">Tier</p>
                  <p className="font-medium text-[#0F172A] text-sm capitalize">
                    {test.tier}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/admin/edit-lab-test/${test.id}`}
                  className="flex-1 text-center bg-[#2563EB] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleStatus(test.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                    test.is_active
                      ? "bg-[#EF4444] hover:bg-[#dc2626]"
                      : "bg-[#14B8A6] hover:bg-[#0F766E]"
                  }`}
                >
                  {test.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
