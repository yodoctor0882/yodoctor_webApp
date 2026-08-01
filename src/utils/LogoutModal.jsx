import { FaTimes } from "react-icons/fa";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null; 
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close modal"
        >
          <FaTimes className="text-xl" />
        </button>

        <div className="text-center mt-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Are you sure you want to logout?
          </h2>

          <div className="flex items-center justify-center space-x-6 mt-6">
           
            <button
              onClick={onClose}
              className="border border-gray-300 text-gray-700 font-medium px-6 py-2 rounded-lg cursor-pointer"
            >
              No
            </button>
            
             <button
              onClick={onConfirm}
              className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow  cursor-pointer"
            >
              Yes
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LogoutModal;
