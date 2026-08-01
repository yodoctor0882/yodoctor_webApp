import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { notify } from "../../utils/notify";

export default function AddLabTest() {
  const [categories, setCategories] = useState([]);
  const [includes, setIncludes] = useState([""]);

  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    tagline: "",
    price: "",
    mrp: "",
    parameters: "",
    report_time: "",
    fasting: "",
    tier: "essential",
    type: "test",
    description: "",
    image: null,
    is_popular: false,
  });

  useEffect(() => {
    fetchCategories();

    if (id) {
      fetchTest();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/patient/lab/categories");

      setCategories(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    console.log(e.target.files[0]);

    setForm((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };
  const fetchTest = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/admin/lab/tests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const test = res.data.data;

      setForm({
        name: test.name || "",
        category_id: test.category_id || "",
        tagline: test.tagline || "",
        price: test.price || "",
        mrp: test.mrp || "",
        parameters: test.parameters || "",
        report_time: test.report_time || "",
        fasting: test.fasting || "",
        tier: test.tier || "essential",
        type: test.type || "test",
        description: test.description || "",
        image: test.image || "",
        is_popular: Boolean(test.is_popular),
      });

      setIncludes(test.includes || [""]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) return notify.info("Test name required");
    if (!form.category_id) return notify.info("Select category");
    if (!form.price) return notify.info("Price required");

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("category_id", form.category_id);
      formData.append("tagline", form.tagline);
      formData.append("price", form.price);
      formData.append("mrp", form.mrp);
      formData.append("parameters", form.parameters);
      formData.append("report_time", form.report_time);
      formData.append("fasting", form.fasting);
      formData.append("tier", form.tier);
      formData.append("type", form.type);
      formData.append("description", form.description);
      formData.append("is_popular", form.is_popular ? 1 : 0);

      includes
        .filter((item) => item.trim() !== "")
        .forEach((item) => {
          formData.append("includes[]", item);
        });

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      if (isEdit) {
        await api.put(`/admin/lab/tests/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        notify.success("Test Updated Successfully");
      } else {
        await api.post("/admin/lab/tests", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        notify.success("Test Added Successfully");
      }

      navigate("/admin/lab-test");
    } catch (err) {
      console.error(err);
      notify.error("Something went wrong");
    }
  };

  const inputClass =
    "w-full border border-[#E2E8F0] bg-white p-3 rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors";
  const labelClass = "block text-sm font-medium text-[#0F172A] mb-1.5";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A]">
            {isEdit ? "Edit Lab Test" : "Add Lab Test"}
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {isEdit
              ? "Update the details of this lab test"
              : "Fill in the details to create a new lab test"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-6"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Test Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Complete Blood Count"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Tagline</label>
              <input
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                placeholder="Short one-line description"
                className={inputClass}
              />
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2">
              Pricing & Details
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>MRP (₹)</label>
                <input
                  type="number"
                  name="mrp"
                  value={form.mrp}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Parameters Count</label>
                <input
                  type="number"
                  name="parameters"
                  value={form.parameters}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Report Time</label>
                <input
                  name="report_time"
                  value={form.report_time}
                  onChange={handleChange}
                  placeholder="Ex: 24 Hours"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Fasting Required?</label>
                <input
                  name="fasting"
                  value={form.fasting}
                  onChange={handleChange}
                  placeholder="e.g. 8-10 hours / Not required"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Tier</label>
                <select
                  name="tier"
                  value={form.tier}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="essential">Essential</option>
                  <option value="advanced">Advanced</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          </div>

          {/* Media & Visibility */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2">
              Media & Visibility
            </h2>

            <div>
              <label className={labelClass}>Upload Image</label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={inputClass}
              />

              {form.image && (
                <img
                  src={
                    typeof form.image === "string"
                      ? form.image
                      : URL.createObjectURL(form.image)
                  }
                  alt="Preview"
                  className="w-28 h-28 mt-3 rounded-lg object-cover border"
                />
              )}
            </div>

            <label className="flex items-center gap-2.5 text-sm text-[#0F172A] cursor-pointer bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 w-fit">
              <input
                type="checkbox"
                name="is_popular"
                checked={form.is_popular}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-[#2563EB]"
              />
              Mark as Popular Test
            </label>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed description of this test..."
                className={`${inputClass} resize-none`}
                rows={5}
              />
            </div>
          </div>

          {/* Includes Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2">
              Test Includes
            </h2>

            <div className="space-y-2">
              {includes.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => {
                      const updated = [...includes];
                      updated[index] = e.target.value;
                      setIncludes(updated);
                    }}
                    className={inputClass}
                    placeholder="Include Name"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setIncludes(includes.filter((_, i) => i !== index))
                    }
                    className="bg-[#EF4444] text-white px-3.5 rounded-lg hover:bg-[#dc2626] transition-colors shrink-0"
                    aria-label="Remove include"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIncludes([...includes, ""])}
              className="inline-flex items-center gap-1.5 w-full sm:w-auto bg-[#14B8A6] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0F766E] transition-colors justify-center"
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
              Add Include
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#2563EB] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition-colors mt-4"
            >
              {isEdit ? "Update Test" : "Save Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
