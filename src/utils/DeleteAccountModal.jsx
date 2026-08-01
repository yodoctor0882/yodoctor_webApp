import { useState } from "react";
import { notify } from "./notify";

const DeleteAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleDelete = () => {
    if (!password.trim()) {
      notify.error("Please enter your password.");
      return;
    }

    onConfirm(password);
    setPassword("");
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-[420px] p-6 shadow-xl">

        <h2 className="text-xl font-bold text-red-600">
          Delete Account
        </h2>

        <p className="mt-3 text-gray-600">
          This action will deactivate your account.
          You won't be able to login again unless your account is restored.
        </p>

        <input
          type="password"
          placeholder="Enter your password"
          className="w-full mt-5 border rounded-lg px-4 py-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={() => {
              setPassword("");
              onClose();
            }}
            className="px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="px-5 py-2 rounded-lg bg-red-600 text-white"
          >
            Delete Account
          </button>

        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;