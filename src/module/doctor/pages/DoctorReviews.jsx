import React, { useEffect, useState } from "react";
import { getDoctorReviews } from "../../../services/doctorService";
import { notify } from "../../../utils/notify";

const DoctorReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);

  const loadReviews = async (currentPage) => {
    setLoading(true);
    try {
      const { data } = await getDoctorReviews(currentPage);
 console.log("API DATA:", data)
     setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setHasMore(data.hasMore ?? data.reviews?.length > 0);

      // ✅ NEW
      setAvgRating(data.avgRating);
      setTotalReviews(data.totalReviews);
    } catch {
      notify.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
    return Math.floor(diff / 86400) + " days ago";
  };

  const getColor = (rating) => {
    if (rating >= 4) return "border-l-green-500";
    if (rating >= 3) return "border-l-yellow-500";
    return "border-l-red-500";
  };

  useEffect(() => {
    loadReviews(page);
  }, [page]);

  return (
    <div
      className="font-dm min-h-screen bg-[#f5f3ef] px-4 sm:px-6 py-10"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 10% 5%, rgba(14,116,144,0.05) 0%, transparent 50%)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <div className="animate-fade-up mb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-playfair text-[clamp(24px,3.5vw,36px)] font-bold text-[#1c2b33] leading-tight m-0">
              Patient Reviews
            </h1>
            {avgRating && (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl">
                  <span className="text-amber-400 text-lg">★</span>
                  <span className="text-xl font-bold">{avgRating}</span>
                  <span className="text-xs text-gray-500">/ 5</span>
                </div>

                {/* ✅ ADD THIS */}
                <span className="text-xs text-gray-500 mt-1">
                  Based on {totalReviews} reviews
                </span>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-9 h-9 border-4 border-[rgba(14,116,144,0.2)] border-t-[#0e7490] rounded-full animate-spin" />
            <p className="font-dm text-[13px] text-[#6b7f8a]">
              Loading reviews…
            </p>
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl opacity-30">⭐</span>
            <p className="font-dm text-[14px] text-[#6b7f8a]">No reviews yet</p>
            <p className="font-dm text-[12px] text-[#9fb0b8]">
              Patient reviews will appear here after consultations
            </p>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="animate-fade-up [animation-delay:0.07s] space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className={`bg-white border border-black/[0.07] rounded-[18px] p-6 transition hover:shadow-md border-l-4 ${getColor(r.rating)}`}
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {r.patientImage ? (
                    <img
                      src={
                        r.patientImage.startsWith("http")
                          ? r.patientImage
                          : `${import.meta.env.VITE_API_URL}/${r.patientImage}`
                      }
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0e7490] text-white flex items-center justify-center text-sm font-bold">
                      {r.familyMemberName || r.patientName?.[0]}
                    </div>
                  )}

                  <p className="font-dm text-[13px] text-[#1c2b33] font-semibold">
                    {r.reviewedPatientName || "Patient"}
                  </p>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-[18px] ${star <= r.rating ? "text-amber-400" : "text-[#e5e7eb]"}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="font-dm text-[12px] text-[#6b7f8a] ml-2 self-center">
                    {r.rating}/5
                  </span>
                </div>

                {r.comment && (
                  <p className="font-dm text-[14px] text-[#1c2b33] leading-relaxed mb-3">
                    {r.comment}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    ✔ Verified • {getTimeAgo(r.created_at)}
                  </p>

                  <span className="text-green-600 text-xs font-semibold">
                    ✔ Verified Patient
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="animate-fade-up [animation-delay:0.13s] flex justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="font-dm px-6 py-2.5 rounded-full text-[13px] font-medium text-[#6b7f8a] bg-white border border-black/[0.08] hover:bg-[#f3f4f6] disabled:opacity-40 transition cursor-pointer"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              ← Prev
            </button>
            <span className="font-dm text-[13px] font-semibold text-[#1c2b33] bg-[#ecfeff] text-[#0e7490] px-4 py-2 rounded-full border border-[rgba(14,116,144,0.15)]">
              Page {page}
            </span>
            <button
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="font-dm px-6 py-2.5 rounded-full text-[13px] font-medium text-[#6b7f8a] bg-white border border-black/[0.08] hover:bg-[#f3f4f6] disabled:opacity-40 transition cursor-pointer"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorReviews;
