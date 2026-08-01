import api from "../services/api";

/* ================== API → UI MAPPER ================== */
const mapFromApi = (m) => ({
  id: m.id,
  fullName: m.full_name,
  gender: m.gender,
  dob: m.dob ? m.dob.slice(0, 10) : "",
  age: m.age,
  bloodGroup: m.blood_group,
  heightCm: m.height_cm,   // ✅ FIX
  weightKg: m.weight_kg,   // ✅ FIX
  relation: m.relation,
});

/* ================== UI → API MAPPER ================== */
const mapToApi = (m) => ({
  fullName: m.fullName,
  gender: m.gender,
  dob: m.dob,
  bloodGroup: m.bloodGroup,
  heightCm: m.heightCm,   // ✅ FIX
  weightKg: m.weightKg,   // ✅ FIX
  relation: m.relation,
});

/* ================== SERVICE ================== */
const FamilyService = {
  getAll: async () => {
    const res = await api.get("/patient/getfamily");
    return res.data.members.map(mapFromApi);
  },

  getById: async (id) => {
    const res = await api.get("/patient/getfamily");
    const member = res.data.members.find(
      (m) => m.id === Number(id)
    );
    return mapFromApi(member);
  },

  create: async (data) => {
    return api.post("/patient/addfamily", mapToApi(data));
  },

  update: async (id, data) => {
    return api.put(`/patient/updatefamily/${id}`, mapToApi(data));
  },

  remove: async (id) => {
    return api.delete(`/patient/deletefamily/${id}`);
  },
};

export default FamilyService;
