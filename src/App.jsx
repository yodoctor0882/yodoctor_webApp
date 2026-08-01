import Router from "./routes/Router";
import { LanguageProvider } from "./context/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import GlobalSnackbar from "./components/common/GlobalSnackbar";
import { ImageProvider } from "./context/ImageContext";
const App = () => {
  return (
    <HelmetProvider>
      <ImageProvider>  
        <LanguageProvider>
         
          <Router />
        </LanguageProvider>
      </ImageProvider>

      <GlobalSnackbar position="top-right" autoClose={2000} hideProgressBar />
    </HelmetProvider>
  );
};

export default App;