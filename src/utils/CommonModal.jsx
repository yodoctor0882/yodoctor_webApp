const CommonModal = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-sm bg-white/30"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          ✕
        </button>

        {title && (
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            {title}
          </h3>
        )}

        {children}
      </div>
    </div>
  );
};

export default CommonModal;
