import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="relative overflow-hidden pt-12 pb-6 text-white"
      style={{ backgroundColor: "#0072BC" }}
    >
      <div
        className="absolute top-0 left-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          transform: "translate(-30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          transform: "translate(30%, 30%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm sm:text-base">
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-base sm:text-lg pb-1.5 border-b border-white/40 w-fit tracking-wide">
            Yo Doctor
          </span>
          <Link
            to="/about"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to="/service"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            Services
          </Link>
          <Link
            to="/contact"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            Contact
          </Link>
          <Link
            to="/help"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            Help
          </Link>
          <Link
            to="/refund-policy"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            Refund Policy
          </Link>
          <Link
            to="/privacy-policy"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-semibold text-base sm:text-lg pb-1.5 border-b border-white/40 w-fit tracking-wide">
            For Patients
          </span>
          <p className="text-white/80 hover:text-white transition-colors duration-200">
            Ask Free Health Questions
          </p>
          <p className="text-white/80 hover:text-white transition-colors duration-200">
            {" "}
            Search for Doctors
          </p>
          <p className="text-white/80 hover:text-white transition-colors duration-200">
            {" "}
            Search for Clinics
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-semibold text-base sm:text-lg pb-1.5 border-b border-white/40 w-fit tracking-wide">
            For Doctors
          </span>
          <p className="text-white/80 hover:text-white transition-colors duration-200">
            Yo Doctor Consult
          </p>
          <p className="text-white/80 hover:text-white transition-colors duration-200">
            Yo Doctor Health Feed
          </p>
          <p className="text-white/80 hover:text-white transition-colors duration-200">
            Yo Doctor Profile
          </p>
          <p className="text-white/80 hover:text-white transition-colors duration-200">
            For Clinics
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-semibold text-base sm:text-lg pb-1.5 border-b border-white/40 w-fit tracking-wide">
            Social
          </span>
          <a
            href="https://www.facebook.com/share/1DSX3bCXAc/  "
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            Facebook
          </a>
          <a
            href="https://www.linkedin.com/company/levesque-private-limited/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            LinkedIn
          </a>
          <a
            href=" https://www.youtube.com/@voice_ofbundelkhand"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            YouTube
          </a>
          <a
            href="https://www.instagram.com/yodoctor_official"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            Instagram
          </a>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto mx-6 mt-10 mb-6 h-px bg-white/25" />

      <div className="relative z-10 flex flex-col items-center text-center gap-1.5 px-4">
        <span className="text-sm sm:text-base text-white/90">
          🩺 Yo Doctor — <span className="font-semibold">Smart care</span> with
          a <span className="font-semibold">human touch</span>
        </span>
        <p className="text-xs sm:text-sm text-white/80">
          Copyright &copy; 2026, Levesque Private Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
