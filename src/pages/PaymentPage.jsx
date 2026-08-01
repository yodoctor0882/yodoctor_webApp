import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

import { CreditCard, Sparkles, ShieldCheck } from "lucide-react";
import { notify } from "../utils/notify";

const PaymentPage = () => {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState("monthly");
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const location = useLocation();

  const isUpgrade = location.state?.isUpgrade || false;

  const currentSubscriptionId = location.state?.subscriptionId;

  // ================= PLANS =================

  useEffect(() => {
    const handlePopState = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("loggedInUser");

      navigate(-1);

      navigate("/doctorloginpage", {
        replace: true,
        state: {
          message: "Your session has expired. Please login again.",
        },
      });
    };

    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      navigate("/doctorloginpage", {
        replace: true,
      });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);

      const res = await api.get("/razorpay/plans");

      setPlans(res.data.data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  };

  // ================= RAZORPAY PAYMENT =================

  const handleContinue = async () => {
    try {
      if (loading) return;

      if (!selectedPlan) {
        notify.warning("Please select a plan to continue", "error");
        return;
      }


      const billingType = billing === "yearly" ? "yearly" : "monthly";

      const { data } = await api.post("/razorpay/subscriptions/create", {
        planId: selectedPlan.id,
        billing: billingType,
        isUpgrade,
      });

      const razorpaySubscriptionId = data?.data?.subscription_id;

      if (!razorpaySubscriptionId) {
        setLoading(false);

        notify.error("Subscription ID not received", "error");

        return;
      }

      const localSubscriptionId = data?.data?.local_subscription_id;

      if (!localSubscriptionId) {
        setLoading(false);

        notify.error("Local subscription ID not received", "error");

        return;
      }

      const options = {
        key: data.data.razorpay_key,

        subscription_id: razorpaySubscriptionId,

        name: "YoDoctor",

        description: selectedPlan.name,

        prefill: data.data.prefill,

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        handler: async (response) => {
          console.log("RAZORPAY RESPONSE =>", response);
          try {
            const verifySub = await api.post("/razorpay/subscriptions/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              local_subscription_id: localSubscriptionId,
            });

            let paymentVerified = true;

            if (response.razorpay_order_id) {
              const verifyPayment = await api.post(
                "/razorpay/payments/verify",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              );

              paymentVerified = verifyPayment.data.success;
            }

            if (verifySub.data.success && paymentVerified) {
              setLoading(false);
              navigate("/payment-success");
            } else {
              navigate("/payment-failed", {
                state: {
                  amount:
                    selectedPlan?.totalPrice ??
                    selectedPlan?.monthlyPrice ??
                    selectedPlan?.yearlyPrice ??
                    0,
                },
              });
            }
          } catch (err) {
            console.error(err);

            setLoading(false);

            navigate("/payment-failed", {
              state: {
                amount:
                  selectedPlan?.totalPrice ??
                  selectedPlan?.monthlyPrice ??
                  selectedPlan?.yearlyPrice ??
                  0,
              },
            });
          }
        },
      };

      if (!window.Razorpay) {
        setLoading(false);

        notify.error("Razorpay SDK not loaded", "error");

        return;
      }

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Payment Failed:", response?.error);

        setLoading(false);

        navigate("/payment-failed", {
          state: {
            amount:
              selectedPlan?.totalPrice ??
              selectedPlan?.monthlyPrice ??
              selectedPlan?.yearlyPrice ??
              0,
          },
        });
      });

      razorpay.open();
    } catch (err) {
      console.error(err);

      setLoading(false);

      notify.error(err?.response?.data?.message || "Payment failed", "error");
    }
  };
  return (
    <div className="min-h-screen bg-[#eef4fb] py-10 px-4">
      {/* HEADER */}

      <div className="max-w-7xl mx-auto text-center mb-14 mt-14">
        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-5 py-2 rounded-full text-sm font-bold mb-6">
          <Sparkles size={16} />
          HEALTHCARE PLANS
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4">
          Choose Your Plan
        </h1>

        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Flexible pricing for healthcare providers of every size.
          <br />
          No hidden fees.
        </p>

        {/* TOGGLE */}

        <div className="mt-8 flex justify-center">
          <div className="bg-white border border-teal-200 rounded-full p-2 flex shadow-xl">
            <button
              onClick={() => {
                setBilling("monthly");
                setSelectedPlan(null);
              }}
              className={`px-6 py-2 rounded-full text-md font-bold transition-all duration-300
              ${
                billing === "monthly"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg"
                  : "text-slate-600"
              }`}
            >
              Monthly
            </button>

            <button
              onClick={() => {
                setBilling("yearly");
                setSelectedPlan(null);
              }}
              className={`px-6 py-2 rounded-full text-md font-bold transition-all duration-300 flex items-center gap-2
              ${
                billing === "yearly"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg"
                  : "text-slate-600"
              }`}
            >
              Yearly
              <span className="bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full text-[10px] font-black">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* PLANS */}

      <div className="max-w-[1150px] mx-auto">
        <div className="flex flex-wrap justify-center gap-6">
          {plans
            .filter((plan) => plan.category === billing)
            .map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative w-[300px] bg-white rounded-[18px] border border-[#e5e7eb]
overflow-hidden transition-all duration-300 cursor-pointer
hover:shadow-lg
                ${
                  selectedPlan?.id === plan.id
                    ? "border-teal-500 shadow-[0_20px_50px_rgba(16,185,129,0.18)]"
                    : "border-slate-200"
                }`}
              >
                {/* BADGE */}

                <div
                  className={`absolute top-5 right-5 w-[65px] h-[65px]
rounded-full bg-[#14b8a6]
text-white text-[10px] font-bold
flex items-center justify-center
text-center leading-tight shadow-md z-10 px-2`}
                >
                  {plan.freeText}
                </div>

                {/* HEADER */}

                <div
                  className={`${
                    billing === "monthly" ? "bg-[#0f766e]" : "bg-[#0f766e]"
                  } py-3 text-center`}
                >
                  <h2 className="text-white font-bold text-[15px] tracking-wide">
                    {plan.name}
                  </h2>
                </div>

                {/* BODY */}

                <div className="px-7 py-8 flex flex-col min-h-[360px]">
                  {/* PRICE */}

                  <div className="text-center">
                    {plan.discount && (
                      <p className="text-slate-400 line-through text-lg font-semibold mb-2">
                        ₹{plan.originalPrice.toLocaleString("en-IN")}
                      </p>
                    )}

                    <h1 className="text-[40px] font-bold text-[#0f172a] leading-none">
                      ₹
                      {(
                        plan.totalPrice ??
                        plan.monthlyPrice ??
                        plan.yearlyPrice ??
                        0
                      ).toLocaleString("en-IN")}
                    </h1>

                    <p className="text-slate-500 text-sm mt-3 font-medium">
                      {plan.months} Months Subscription
                    </p>
                  </div>

                  {/* SUBTITLE */}

                  <div className="mt-7 text-center">
                    <h3 className="text-[18px] font-bold text-slate-800">
                      {plan.subtitle}
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed mt-3">
                      {plan.description}
                    </p>
                  </div>

                  {/* OFFER */}

                  {plan.discount && (
                    <div className="flex justify-center mt-5">
                      <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black">
                        {plan.discount}
                      </span>
                    </div>
                  )}

                  {/* BUTTON */}

                  <button
                    className={`w-full mt-auto py-3 rounded-lg text-sm font-semibold transition-all duration-300
                    ${
                      selectedPlan?.id === plan.id
                        ? "bg-[#14b8a6] text-white"
                        : "bg-[#f1f5f9] text-slate-700 hover:bg-[#e2e8f0]"
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* PAYMENT SUMMARY */}

        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-[20px] border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-7">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <CreditCard className="text-blue-600" size={22} />
              </div>

              <h2 className="font-black text-2xl text-slate-900">
                Payment Summary
              </h2>
            </div>

            {!selectedPlan ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="w-20 h-20 rounded-[24px] bg-slate-100 flex items-center justify-center mb-5">
                  <ShieldCheck className="text-slate-400" size={34} />
                </div>

                <h3 className="text-xl font-bold text-slate-700 mb-2">
                  No plan selected
                </h3>

                <p className="text-slate-400 text-sm">
                  Choose a subscription plan above
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Subscription</span>

                    <span className="font-bold text-slate-800">
                      {selectedPlan.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Original Price</span>

                    <span className="font-bold text-slate-800">
                      ₹
                      {Number(selectedPlan.originalPrice || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>

                  {selectedPlan.discount && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Discount</span>

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        {selectedPlan.discount}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-slate-300 my-7"></div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-black text-slate-800">
                    Total Payable
                  </span>

                  <span className="text-3xl font-black text-slate-900">
                    ₹
                    {(
                      selectedPlan.totalPrice ??
                      selectedPlan.monthlyPrice ??
                      selectedPlan.yearlyPrice ??
                      0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* PAYMENT BUTTON */}

                <button
                  disabled={loading}
                  onClick={handleContinue}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg bg-[#1d4843] hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Continue to Payment →"}
                </button>

                <p className="text-center text-slate-400 text-sm mt-5">
                  Secured by Razorpay • Cancel anytime
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
