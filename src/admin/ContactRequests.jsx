import { useEffect, useState } from "react";
import api from "../services/api";
import { notify } from "../utils/notify";
const ContactRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/contact-requests");
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
      notify.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const markResolved = async (id) => {
    try {
      await api.put(`/admin/contact-requests/${id}`);
      fetchContacts();
    } catch (err) {
      console.error(err);
      notify.error("Failed to update");
    }
  };

  const deleteRequest = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact request?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/contact-requests/${id}`);
      notify.success("Contact request deleted successfully");
      fetchContacts(); // Refresh data
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete contact request");
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-medium mb-5">📩 Contact Requests</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse bg-white text-sm">
            {/* HEADER */}
            <thead className="bg-[#0072BC] text-white">
              <tr>
                {[
                  "S.No",
                  "Name",
                  "Mobile",
                  "Email",
                  "Concern",
                  "Sub Concern",
                  "Message",
                  "Status",
                  "Date",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-medium text-sm"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-5 text-gray-400">
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-400">{item.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.mobile}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.concern}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.sub_concern}
                    </td>

                    {/* Message — truncated */}
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                      {item.message || "-"}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.status === "pending" ? (
                          <button
                            onClick={() => markResolved(item.id)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-green-600 font-medium text-sm">
                            Done
                          </span>
                        )}

                        <button
                          onClick={() => deleteRequest(item.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactRequests;
