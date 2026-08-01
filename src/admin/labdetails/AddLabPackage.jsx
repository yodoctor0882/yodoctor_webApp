import { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { notify } from "../../utils/notify";

export default function AddLabPackage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const { id } = useParams();

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
    type: "package",
    description: "",
    image: "",
    is_popular: false,
  });

  const [selectedTests, setSelectedTests] = useState([]);

  useEffect(() => {
    fetchTests();
    fetchCategories();

    if (id) {
      fetchPackageDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/patient/lab/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPackageDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/admin/lab/packages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const pkg = res.data.data;

      setForm({
        name: pkg.name || "",
        category_id: pkg.category_id || "",
        tagline: pkg.tagline || "",
        price: pkg.price || "",
        mrp: pkg.mrp || "",
        parameters: pkg.parameters || "",
        report_time: pkg.report_time || "",
        fasting: pkg.fasting || "",
        tier: pkg.tier || "essential",
        type: "package",
        description: pkg.description || "",
        image: pkg.image || "",
        is_popular: Boolean(pkg.is_popular),
      });

      setSelectedTests(pkg.tests ? pkg.tests.map((item) => item.id) : []);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/lab/tests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API Response:", res.data);
      console.log("Tests:", res.data.data);

      setTests(res.data.data || []);
    } catch (error) {
      console.log(error);
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
    setForm((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleTestSelect = (id) => {
    if (selectedTests.includes(id)) {
      setSelectedTests(selectedTests.filter((item) => item !== id));
    } else {
      setSelectedTests([...selectedTests, id]);
    }
  };

  useEffect(() => {
    const totalParams = tests
      .filter((t) => selectedTests.includes(t.id))
      .reduce((sum, t) => sum + Number(t.parameters || 0), 0);

    setForm((prev) => ({
      ...prev,
      parameters: totalParams,
    }));
  }, [selectedTests, tests]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      return notify.info("Package name required");
    }

    if (!form.category_id) {
      return notify.info("Select category");
    }

    if (!form.price) {
      return notify.info("Price required");
    }

    if (!form.mrp) {
      return notify.info("MRP required");
    }

    if (Number(form.mrp) < Number(form.price)) {
      return notify.info("MRP cannot be less than Price");
    }

    if (selectedTests.length === 0) {
      return notify.info("Please select at least one test");
    }

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

      selectedTests.forEach((testId) => {
        formData.append("tests[]", testId);
      });

      // Image sirf tab bhejo jab nayi image select ki ho
      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      if (isEdit) {
        await api.put(`/admin/lab/packages/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        notify.success("Package Updated Successfully");
      } else {
        await api.post("/admin/lab/packages", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        notify.success("Package Added Successfully");
      }

      navigate("/admin/lab-packages");
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

      notify.error(error.response?.data?.message || "Something went wrong");
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
            {isEdit ? "Edit Lab Package" : "Add Lab Package"}
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {isEdit
              ? "Update the details of this lab package"
              : "Bundle multiple tests together into a package"}
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
                <label className={labelClass}>Package Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Full Body Checkup"
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
                  value={form.parameters}
                  readOnly
                  className={`${inputClass} bg-[#F8FAFC] text-[#64748B] cursor-not-allowed`}
                />
                <p className="text-xs text-[#64748B] mt-1.5">
                  Auto-calculated from selected tests
                </p>
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
                <label className={labelClass}>Fasting Requirement</label>
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
              Mark as Popular Package
            </label>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed description of this package..."
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Select Tests */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide border-b border-[#E2E8F0] pb-2 flex items-center justify-between flex-wrap gap-1">
              <span>Select Tests</span>
              <span className="text-xs font-medium text-[#2563EB] bg-[#EEF2FF] px-2 py-0.5 rounded-full normal-case tracking-normal">
                {selectedTests.length} selected
              </span>
            </h2>

            <div className="border border-[#E2E8F0] rounded-lg p-3 max-h-72 overflow-y-auto grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 bg-[#F8FAFC]">
              {tests.map((test) => (
                <label
                  key={test.id}
                  className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                    selectedTests.includes(test.id)
                      ? "bg-[#EEF2FF] border border-[#2563EB]/40 text-[#0F172A]"
                      : "border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#0F172A]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.id)}
                    onChange={() => handleTestSelect(test.id)}
                    className="w-4 h-4 shrink-0 rounded accent-[#2563EB]"
                  />
                  <span className="truncate">{test.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#2563EB] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition-colors mt-4"
            >
              {isEdit ? "Update Package" : "Save Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
