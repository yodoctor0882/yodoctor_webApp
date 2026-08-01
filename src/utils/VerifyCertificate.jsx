import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/verify/${certificateId}`)
      .then((res) => setData(res.data))
      .catch(() => setData({ valid: false }));
  }, [certificateId]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-xl text-center">
        <h2 className="text-xl font-bold mb-4">
          Certificate Verification
        </h2>

        {data.valid ? (
          <>
            <p className="text-green-600 font-semibold">✅ Valid Certificate</p>
            <p>Name: {data.data.full_name}</p>
            <p>Type: {data.data.certificate_type}</p>
            <p>Status: {data.status}</p>
          </>
        ) : (
          <p className="text-red-600 font-semibold">❌ Invalid Certificate</p>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;