import api from "./api";

export const createConsultation = async (payload) => {
  const response = await api.post("/api/livekit/create-consultation", payload);

  return response.data;
};

export const getLivekitToken = async (payload) => {
  const response = await api.post("/api/livekit/get-token", payload);

  return response.data;
};

export const endConsultation = async (consultationId) => {
  const response = await api.put(
    `/api/livekit/end-consultation/${consultationId}`,
  );

  return response.data;
};

export const saveMessage = async (payload) => {
  const response = await api.post("/api/livekit/save-message", payload);

  return response.data;
};

export const getMessages = async (consultationId) => {
  const response = await api.get(`/api/livekit/messages/${consultationId}`);

  return response.data;
};


export const getConsultation =
  async (
    consultationId,
  ) => {
    const response =
      await api.get(
        `/api/livekit/consultation/${consultationId}`,
      );

    return response.data;
  };