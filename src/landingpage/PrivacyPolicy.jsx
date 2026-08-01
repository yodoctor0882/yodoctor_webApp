import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Shield,
  Lock,
  Database,
  FileText,
  Phone,
  Mail,
  Cookie,
  CreditCard,
  Bell,
  Trash2,
  Baby,
  Activity,
  LogIn,
  Share2,
  Archive,
  Globe,
  UserCheck,
  MapPin,
  ChevronDown,
  Menu,
  ShieldCheck,
  HeartPulse,
  LifeBuoy,
  Camera,
  Image,
  QrCode,
  Stethoscope,
  ListChecks,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Brand color system (as supplied)                                   */
/*  Primary Blue      #2563EB -> blue-600 / hover blue-700             */
/*  Secondary Teal     #14B8A6 -> teal-500 / hover teal-700             */
/*  Dark Text          #0F172A -> slate-900                            */
/*  Main Background    #F8FAFC -> slate-50                             */
/*  Card Background    #FFFFFF -> white                                */
/*  Light Section Bg   #EEF2FF -> indigo-50                            */
/*  Success #22C55E green-500 · Warning #F59E0B amber-500               */
/*  Error   #EF4444 red-500   · Info    #06B6D4 cyan-500                */
/*  Border  #E2E8F0 slate-200 · Light Text #64748B slate-500            */
/*  Placeholder #94A3B8 slate-400                                       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Small shared bits                                                   */
/* ------------------------------------------------------------------ */

const Dot = () => (
  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
);

const Bullets = ({ items }) => (
  <ul className="mb-4 flex flex-col gap-2">
    {items.map((item, i) => (
      <li
        key={i}
        className="flex items-start gap-3 leading-relaxed text-slate-500"
      >
        <Dot />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const SubHeading = ({ children }) => (
  <h3 className="mb-2 mt-4 text-sm font-bold tracking-wide text-slate-900">
    {children}
  </h3>
);

const Seal = ({ children }) => (
  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-teal-500 bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-700">
    <Lock size={11} />
    {children}
  </span>
);

const Callout = ({ children, tag }) => (
  <div className="mt-2 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
    {tag && <Seal>{tag}</Seal>}
    <span>{children}</span>
  </div>
);

const InfoNote = ({ children, tag }) => (
  <div className="mt-2 flex items-start gap-3 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
    {tag && (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-500 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700">
        {tag}
      </span>
    )}
    <span>{children}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Content model                                                      */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  {
    id: "introduction",
    icon: Shield,
    title: "Introduction",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Yodoctor ("we", "us", "our") operates a digital healthcare platform
          that connects patients with doctors, diagnostic labs, pharmacies and
          related medical services. Your trust is central to what we do, and
          protecting your personal and medical information is our highest
          priority.
        </p>
        <p className="leading-relaxed text-slate-500">
          This Privacy Policy explains what information we collect, why we
          collect it, how we use and protect it, and the choices and rights
          available to you. By creating an account or using the Yodoctor app or
          website, you agree to the practices described here.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    icon: Database,
    title: "Information We Collect",
    body: (
      <>
        <p className="mb-1 leading-relaxed text-slate-500">
          To provide safe and reliable healthcare services, we collect the
          following categories of information:
        </p>

        <SubHeading>Personal details</SubHeading>
        <Bullets
          items={[
            "Full name, date of birth and gender",
            "Email address and phone number",
            "Home or delivery address and city",
            "Profile photo",
            "Account and authentication information",
          ]}
        />

        <SubHeading>Healthcare and service information</SubHeading>
        <Bullets
          items={[
            "Doctor and patient profile information",
            "Medical records, history and reports",
            "Medical conditions or information entered by the user",
            "Lab test results, prescriptions and visit summaries",
            "Appointment and consultation history",
            "Medical certificate requests and related documents",
            "Home-care service requests",
            "Family-member information added by the user",
            "Doctor reviews and feedback",
          ]}
        />

        <SubHeading>Payment information</SubHeading>
        <Bullets
          items={[
            "Transaction details processed securely through Razorpay (we do not store card numbers or UPI PINs)",
          ]}
        />

        <SubHeading>Technical information</SubHeading>
        <Bullets
          items={[
            "Device information, IP address and browser type",
            "Authentication identifiers via Firebase Authentication and Google Sign-In",
          ]}
        />

        <p className="leading-relaxed text-slate-500">
          This information is used only as necessary to provide the features and
          services requested through the application.
        </p>
      </>
    ),
  },
  {
    id: "camera-permission",
    icon: Camera,
    title: "Camera Permission",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Yodoctor may request access to your device's camera for features such
          as:
        </p>
        <Bullets
          items={[
            "Scanning QR codes",
            "Accessing QR-based doctor or healthcare functionality",
            "Capturing images where an application feature requires it",
          ]}
        />
        <p className="mb-3 leading-relaxed text-slate-500">
          Camera access is used only when required for a feature initiated by
          the user.
        </p>
        <Callout tag="No background access">
          Yodoctor does not continuously access or record through your camera in
          the background.
        </Callout>
        <p className="mt-3 leading-relaxed text-slate-500">
          You can deny or revoke camera permission through your device settings.
          Some camera-dependent features may not function if permission is
          denied.
        </p>
      </>
    ),
  },
  {
    id: "location-information",
    icon: MapPin,
    title: "Location Information",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Yodoctor may request access to your device's location, including
          precise or approximate location, when required for location-based
          functionality. Location information may be used for purposes such as:
        </p>
        <Bullets
          items={[
            "Determining your location for healthcare or home-care services",
            "Providing location-relevant services",
            "Helping you provide or select an address",
            "Supporting features that depend on geographic location",
          ]}
        />
        <p className="leading-relaxed text-slate-500">
          Location information is accessed only according to the permissions you
          grant and the functionality provided by the application. You may
          disable location permission through your device settings, although
          certain location-based features may then be unavailable.
        </p>
      </>
    ),
  },
  {
    id: "photos-media",
    icon: Image,
    title: "Photos, Images & Media",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Yodoctor may request access to photos, images, or media stored on your
          device when necessary to allow you to:
        </p>
        <Bullets
          items={[
            "Select or upload a profile image",
            "Upload healthcare-related documents or images",
            "Upload documents required for medical certificate or other supported services",
          ]}
        />
        <p className="leading-relaxed text-slate-500">
          We only access files or media necessary for the action initiated by
          the user, subject to the permissions and system file-selection
          mechanisms provided by your device.
        </p>
      </>
    ),
  },
  {
    id: "qr-code-scanning",
    icon: QrCode,
    title: "QR Code Scanning",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Yodoctor may provide QR-code functionality for interactions between
          patients, doctors, or other supported healthcare workflows. When
          scanning a QR code, the application uses the device camera to read and
          process the QR-code information required to perform the requested
          action.
        </p>
        <InfoNote tag="Note">
          QR scanning does not imply continuous camera recording.
        </InfoNote>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    icon: Activity,
    title: "How We Use Information",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          We use the information we collect to:
        </p>
        <Bullets
          items={[
            "Create and manage user accounts",
            "Authenticate users and keep your account secure",
            "Maintain patient and doctor profiles",
            "Book, manage and remind you of appointments",
            "Provide appointment history and status",
            "Manage prescriptions and visit summaries",
            "Facilitate home-care bookings",
            "Facilitate lab tests and bookings",
            "Process medical certificate requests",
            "Provide QR-code and location-based functionality",
            "Send appointment, order and service-related notifications",
            "Process payments and refunds",
            "Provide customer support",
            "Maintain application security and detect or prevent misuse",
            "Analyse usage to improve app performance and functionality",
            "Comply with applicable legal and regulatory obligations",
          ]}
        />
        <Callout tag="No ad misuse">
          We do not use sensitive healthcare information for unrelated
          advertising purposes.
        </Callout>
      </>
    ),
  },
  {
    id: "google-sign-in",
    icon: LogIn,
    title: "Authentication & Google Sign-In",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Yodoctor provides authentication methods such as email or mobile-based
          login and Google Sign-In via Firebase Authentication. When you choose
          Google Sign-In, we only receive basic profile information such as your
          name, email address and profile picture — according to the permissions
          you grant and the provider's own privacy practices.
        </p>
        <p className="mb-3 leading-relaxed text-slate-500">
          Passwords and authentication credentials are handled using appropriate
          authentication and security mechanisms.
        </p>
        <Callout tag="Never stored">
          We never receive or store your Google account password, and we do not
          access any other Google services on your behalf.
        </Callout>
      </>
    ),
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments & Subscriptions",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          All payments made on Yodoctor are processed through Razorpay, a
          PCI-DSS compliant payment gateway. If Yodoctor offers paid
          subscriptions, those payments are also processed through authorized
          third-party payment providers, and we may receive transaction-related
          information necessary to verify and manage payments or subscriptions.
        </p>
        <Callout tag="Encrypted">
          Yodoctor never stores your card details or UPI PIN. Sensitive payment
          credentials are handled entirely within the authorized payment
          provider's secure, encrypted environment.
        </Callout>
      </>
    ),
  },
  {
    id: "medical-information",
    icon: HeartPulse,
    title: "Medical Information",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Your medical records, prescriptions and reports are stored using
          encrypted, access-controlled cloud infrastructure. Access to this
          information is strictly limited to you and the doctors you consult or
          authorise.
        </p>
        <p className="leading-relaxed text-slate-500">
          Yodoctor staff do not access your medical information except where
          necessary to provide support you have requested, or where required by
          law.
        </p>
      </>
    ),
  },
  {
    id: "data-sharing",
    icon: Share2,
    title: "Data Sharing",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          We share information only where necessary to deliver our services,
          with:
        </p>
        <Bullets
          items={[
            "Doctors you consult, for the purpose of your care",
            "Partner diagnostic labs, to process test bookings",
            "Partner pharmacies, to fulfil medicine orders",
            "Razorpay and authorized payment providers, to process payments",
            "Firebase (Google Cloud), for authentication and infrastructure",
            "Government or regulatory authorities, only when legally required",
          ]}
        />
        <p className="mb-3 leading-relaxed text-slate-500">
          Information may also be disclosed with your consent or at your
          direction, when necessary to provide a requested service, or to
          protect the rights, security, and safety of users, the application, or
          others.
        </p>
        <Callout tag="Never sold">
          We never sell your personal or medical data to anyone.
        </Callout>
      </>
    ),
  },
  {
    id: "healthcare-professionals",
    icon: Stethoscope,
    title: "Healthcare Professionals",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          When you book an appointment or use healthcare functionality, relevant
          information may be made available to the doctor or healthcare
          professional involved in providing that service.
        </p>
        <p className="leading-relaxed text-slate-500">
          Healthcare professionals may also create or manage information such as
          prescriptions, appointment details, certificates, or visit summaries
          where supported by Yodoctor. Their access is limited to information
          necessary for providing the relevant healthcare service.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    icon: Lock,
    title: "Data Security",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          We apply industry-standard safeguards to protect your information,
          including:
        </p>
        <Bullets
          items={[
            "HTTPS encryption for all data in transit",
            "JWT-based secure session authentication",
            "Firebase Authentication for identity verification",
            "Encryption of sensitive data at rest",
            "Role-based access controls",
            "Secure cloud storage infrastructure",
            "Regular monitoring and security reviews",
          ]}
        />
        <p className="leading-relaxed text-slate-500">
          However, no internet-based service, electronic transmission, or
          storage system can be guaranteed to be completely secure.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    icon: Archive,
    title: "Data Retention",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          We retain personal information only for as long as reasonably
          necessary to:
        </p>
        <Bullets
          items={[
            "Provide Yodoctor services",
            "Maintain required healthcare or transaction records",
            "Fulfil the purposes described in this Privacy Policy",
            "Meet legal, regulatory, accounting, security, or dispute-resolution requirements",
          ]}
        />
        <p className="leading-relaxed text-slate-500">
          Retention periods may vary depending on the type of information and
          applicable requirements. When information is no longer required, it
          may be deleted, anonymised, or otherwise handled according to
          applicable requirements.
        </p>
      </>
    ),
  },
  {
    id: "account-deletion",
    icon: Trash2,
    title: "Account & Data Deletion",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          You may request deletion of your account and associated personal data
          at any time by contacting us through the Help Center, an in-app
          account deletion option where available, or by emailing{" "}
          <a
            href="mailto:founder@yodoctor.in"
            className="font-semibold text-blue-600 hover:underline"
          >
            founder@yodoctor.in
          </a>
          .
        </p>
        <p className="leading-relaxed text-slate-500">
          Certain information may be retained where required by law, necessary
          for legitimate security or fraud-prevention purposes, or subject to
          applicable healthcare record-retention requirements, even after your
          account has been deleted.
        </p>
      </>
    ),
  },
  {
    id: "permissions",
    icon: ListChecks,
    title: "Permissions Summary",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Depending on your device, operating system, and the features you use,
          Yodoctor may request the following permissions:
        </p>
        <Bullets
          items={[
            "Camera — for scanning QR codes and supported image-capture functionality",
            "Location — for location-based healthcare, address, or home-care functionality",
            "Photos / Media — for selecting and uploading profile images, documents, or other user-selected files",
            "Notifications — for appointment updates, service notifications, and other relevant alerts where enabled",
          ]}
        />
        <p className="leading-relaxed text-slate-500">
          Permissions can generally be managed or revoked through your device
          settings. Disabling a permission may prevent features dependent on
          that permission from functioning correctly.
        </p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    icon: Baby,
    title: "Children's Privacy",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Yodoctor is not intended for use by children under the age of 13
          without the involvement and supervision of a parent or guardian, and
          is not intended to allow children to independently provide personal
          information where parental or guardian consent is legally required.
        </p>
        <p className="leading-relaxed text-slate-500">
          If information about a minor is provided as part of a family or
          healthcare feature, the person providing that information should have
          the appropriate authority or consent to do so. If we become aware that
          personal information has been collected in violation of applicable
          children's privacy requirements, we will take appropriate steps to
          address it.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          We use cookies and similar technologies to:
        </p>
        <Bullets
          items={[
            "Keep you securely signed in (authentication)",
            "Remember your language preference",
            "Understand how the app is used (analytics)",
            "Improve loading speed and performance",
          ]}
        />
      </>
    ),
  },
  {
    id: "third-party-services",
    icon: Globe,
    title: "Third-Party Services",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Yodoctor relies on trusted third-party providers to operate reliably,
          including for:
        </p>
        <Bullets
          items={[
            "Authentication — Firebase, Google Sign-In",
            "Cloud or server infrastructure — Firebase / Google Cloud, Amazon Web Services (S3)",
            "Maps or location functionality — Google Maps, where enabled",
            "Notifications",
            "Payment or subscription processing — Razorpay and authorized providers, where applicable",
            "Other infrastructure required to operate the application",
          ]}
        />
        <p className="leading-relaxed text-slate-500">
          Information processed by third-party services may also be subject to
          their respective privacy policies and terms. We encourage users to
          review the privacy practices of applicable third-party services.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    icon: UserCheck,
    title: "Your Rights & Choices",
    body: (
      <>
        <p className="mb-3 leading-relaxed text-slate-500">
          Subject to applicable law, you have the right to:
        </p>
        <Bullets
          items={[
            "Access the personal data we hold about you",
            "Correct or update inaccurate information",
            "Request deletion of eligible information or your account",
            "Withdraw or manage device permissions",
            "Request information about how your data is handled",
            "Contact our support team with any privacy questions",
          ]}
        />
      </>
    ),
  },
  {
    id: "changes",
    icon: Bell,
    title: "Changes to This Policy",
    body: (
      <p className="leading-relaxed text-slate-500">
        We may update this Privacy Policy periodically to reflect changes in the
        application, services, legal requirements, or privacy practices. When
        changes are made, the "Last Updated" date at the top of this page will
        be revised. Users are encouraged to review this Privacy Policy
        periodically.
      </p>
    ),
  },
  {
    id: "contact-us",
    icon: Mail,
    title: "Contact Us",
    body: (
      <>
        <p className="mb-4 leading-relaxed text-slate-500">
          If you have questions, concerns, or requests regarding this Privacy
          Policy or your personal information, please contact:
        </p>
        <ul className="flex flex-col gap-3">
          <li className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="shrink-0 text-blue-600" />
            <span className="font-semibold text-slate-700">
              App Name: Yodoctor
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <UserCheck size={16} className="shrink-0 text-blue-600" />
            <span className="font-semibold text-slate-700">
              Developer/Company: Levesque Private Limited
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <Globe size={16} className="shrink-0 text-blue-600" />
            <a
              href="https://yodoctor.in"
              className="font-semibold text-blue-600 hover:underline"
            >
              yodoctor.in
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <Mail size={16} className="shrink-0 text-blue-600" />
            <a
              href="mailto:founder@yodoctor.in"
              className="font-semibold text-blue-600 hover:underline"
            >
              founder@yodoctor.in
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <Phone size={16} className="shrink-0 text-blue-600" />
            <span className="font-semibold text-slate-700">+91-9277207339</span>
          </li>
          <li className="flex items-center gap-2.5">
            <MapPin size={16} className="shrink-0 text-blue-600" />
            <span className="font-semibold text-slate-700">
              Rise Nagar Nigam, Jhansi, Uttar Pradesh 284001
            </span>
          </li>
        </ul>
      </>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function PrivacyPolicy() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current && observerRef.current.disconnect();
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileTocOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 antialiased">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-teal-500 mt-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          aria-hidden="true"
        >
          <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg">
            <Lock className="text-white" size={30} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-50 sm:text-lg">
            Protecting your personal, healthcare, and medical information is our
            highest priority.
          </p>
          <p className="mx-auto mt-3 text-sm font-medium text-blue-100/90">
            Yodoctor — Levesque Private Limited &nbsp;|&nbsp; Last Updated: July
            2026
          </p>
        </div>
      </section>

      {/* ---------------- Mobile TOC accordion trigger ---------------- */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white lg:hidden">
        <button
          onClick={() => setMobileTocOpen((v) => !v)}
          aria-expanded={mobileTocOpen}
          aria-controls="mobile-toc"
          className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 text-sm font-semibold text-slate-700"
        >
          <span className="flex items-center gap-2">
            <Menu size={16} className="text-blue-600" />
            Table of Contents
          </span>
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform ${mobileTocOpen ? "rotate-180" : ""}`}
          />
        </button>
        {mobileTocOpen && (
          <nav id="mobile-toc" className="max-h-72 overflow-y-auto px-5 pb-4">
            <ul className="grid grid-cols-1 gap-1">
              {SECTIONS.map(({ id, title, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollToSection(id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                      activeId === id
                        ? "bg-indigo-50 font-semibold text-blue-600"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={15} />
                    {title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* ---------------- Main content ---------------- */}
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Desktop sticky TOC */}
          <aside className="hidden lg:block">
            <nav
              aria-label="Privacy policy sections"
              className="sticky top-24 max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="mb-2 border-b border-slate-200 px-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                On this page
              </p>
              <ul className="flex flex-col gap-1">
                {SECTIONS.map(({ id, title, icon: Icon }) => {
                  const active = activeId === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => scrollToSection(id)}
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 ${
                          active
                            ? "bg-indigo-50 font-semibold text-blue-600 shadow-sm"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <Icon
                          size={16}
                          className={
                            active ? "text-blue-600" : "text-slate-400"
                          }
                        />
                        {title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Policy content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-md sm:p-2">
            <div className="flex flex-col divide-y divide-slate-200">
              {SECTIONS.map(({ id, title, icon: Icon, body }, i) => (
                <section
                  key={id}
                  id={id}
                  ref={(el) => (sectionRefs.current[id] = el)}
                  tabIndex={-1}
                  aria-labelledby={`${id}-heading`}
                  className="scroll-mt-24 rounded-2xl px-4 py-8 transition-colors duration-200 hover:bg-slate-50 sm:px-8"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-indigo-50 text-blue-600">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2
                        id={`${id}-heading`}
                        className="flex items-baseline gap-2 text-xl font-extrabold text-slate-900 sm:text-2xl"
                      >
                        <span className="text-sm font-bold text-blue-600">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {title}
                      </h2>
                      <div className="mt-3 text-[15px]">{body}</div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- Need help card ---------------- */}
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 p-8 text-center shadow-lg sm:p-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <LifeBuoy className="text-white" size={22} />
          </div>
          <h3 className="text-2xl font-extrabold text-white">Need Help?</h3>
          <p className="mx-auto mt-2 max-w-xl text-blue-50">
            Our support team is here for any privacy or account questions —
            reach out any time at{" "}
            <a
              href="mailto:founder@yodoctor.in"
              className="font-semibold underline"
            >
              founder@yodoctor.in
            </a>
            .
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/help"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <FileText size={16} /> Visit Help Center
            </a>
            <a
              href="mailto:founder@yodoctor.in"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/20"
            >
              <Mail size={16} /> Contact Us
            </a>
          </div>
        </div>

        {/* ---------------- Footer note ---------------- */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Yodoctor is operated by Levesque Private Limited. This policy may be
          updated periodically.
        </p>
      </main>
    </div>
  );
}
