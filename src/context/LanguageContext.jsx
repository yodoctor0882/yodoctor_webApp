


import { createContext, useContext, useEffect, useState } from "react";
import { lang } from "../language";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang && lang[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (l) => {
    if (lang[l]) {
      setLanguage(l);
      localStorage.setItem("lang", l);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
