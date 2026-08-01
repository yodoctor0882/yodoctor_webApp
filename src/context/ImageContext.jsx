import { createContext, useContext, useState, useEffect } from "react";

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [image, setImageState] = useState(null);

  useEffect(() => {
  const stored = localStorage.getItem("profileImage");
  if (stored) {
    setImageState(stored); 
  }
}, []);

  const setImage = (rawUrl) => {
    if (!rawUrl) {
      localStorage.removeItem("profileImage");
      setImageState(null);
      return;
    }

    const fullUrl = `${rawUrl}?t=${Date.now()}`;
    setImageState(fullUrl);

    localStorage.setItem("profileImage", rawUrl);
  };

  return (
    <ImageContext.Provider value={{ image, setImage }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => useContext(ImageContext);