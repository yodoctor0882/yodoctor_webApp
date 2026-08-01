
import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BusinessIcon from "@mui/icons-material/Business";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import Check from "@mui/icons-material/Check";

import Step1Personal from "./Step1Personal";
import Step2Professional from "./Step2Professional";
import Step3Clinic from "./Step3Clinic";
import Step4Practice from "./Step4Practice";
import Step5Consultation from "./Step5Consultation";
import Step6Documents from "./Step6Documents";
import Step7Declaration from "./Step7Declaration";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PremiumConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 25,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 4,
    marginLeft: 5,
    marginRight: 5,
    border: 0,
    background: "#e5e7eb",
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    background: "linear-gradient(90deg, #06b6d4, #3b82f6, #6366f1)",
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    background: "linear-gradient(90deg, #10b981, #059669)",
  },
}));

const PremiumStepIconRoot = styled("div")(({ ownerState }) => ({
  background: ownerState.active
    ? "linear-gradient(135deg, #06b6d4, #6366f1)"
    : ownerState.completed
    ? "linear-gradient(135deg, #10b981, #059669)"
    : "#e5e7eb",
  color: ownerState.active || ownerState.completed ? "#fff" : "#6b7280",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: ownerState.active
    ? "0 0 15px rgba(99,102,241,0.5)"
    : "0 4px 10px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease",
}));

function PremiumStepIcon(props) {
  const { active, completed, icon } = props;

  const icons = {
    1: <PersonIcon />,
    2: <SchoolIcon />,
    3: <LocalHospitalIcon />,
    4: <BusinessIcon />,
    5: <AccessTimeIcon />,
    6: <DescriptionIcon />,
    7: <Check />,
  };

  return (
    <PremiumStepIconRoot ownerState={{ active, completed }}>
      {completed ? <Check /> : icons[String(icon)]}
    </PremiumStepIconRoot>
  );
}

const DoctorRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    personal: {
      fullName: "",
      email: "",
      mobile: "",
      gender: "",
      bio: "",
      password: "",
      confirmPassword: "",
    },
    professional: {
      qualification: "",
      specialization: "",
      experience: "",
      regNumber: "",
      stateCouncil: "",
      validTill: "",
    },
    clinic: [
  {
    clinicName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    mapsLink: "",
    languages: [],
    otherLanguage: "",
  }
],
    practice: {
      practiceType: "Solo Practice",
      hospitalName: "",
    },
    consultation: {
      fee: "",
      duration: "15 mins",
      selectedDays: ["M", "T", "W", "TH", "F"],
      morningStart: "09:00",
      morningEnd: "13:00",
      eveningStart: "",
      eveningEnd: "",
    },
    documents: {
      profile: null,
      certificate: null,
      idProof: null,
      clinicProof: null,
    },
    declarations: {
      accurate: false,
      display: false,
      privacy: false,
      terms: false,
    },
  });


  const nextStep = () => {
    setActiveStep((prev) => {
      const next = prev + 1;

      setMaxStepReached((currentMax) =>
        next > currentMax ? next : currentMax
      );

      return next;
    });
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  const steps = [
    "Personal",
    "Professional",
    "Clinic",
    "Practice",
    "Consultation",
    "Documents",
    "Submit",
  ];

  const props = { formData, setFormData, nextStep, prevStep };


useEffect(() => {
  const stepFromUrl = searchParams.get("step");

  if (stepFromUrl) {
    const stepIndex = Number(stepFromUrl) - 1;

    setActiveStep(stepIndex);
    setMaxStepReached(stepIndex);

    localStorage.setItem("doctor_step", stepIndex);
    return;
  }

  const savedData = localStorage.getItem("doctor_form_data");

  if (savedData) {
    try {
      setFormData(JSON.parse(savedData));
    } catch {
      localStorage.removeItem("doctor_form_data");
    }
  }

  const savedStep = localStorage.getItem("doctor_step");

  if (savedStep) {
    setActiveStep(Number(savedStep));
    setMaxStepReached(Number(savedStep));
  }
}, []);

useEffect(() => {
  localStorage.setItem("doctor_form_data", JSON.stringify(formData));
}, [formData]);

useEffect(() => {
  localStorage.setItem("doctor_step", activeStep);
}, [activeStep]);
  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-10 
bg-gradient-to-br from-cyan-50 via-white to-indigo-50 
min-h-screen mt-16 overflow-x-hidden">
     <div className="w-full overflow-x-auto">
  <div className="min-w-[700px] sm:min-w-full">
    <Stepper
      alternativeLabel
      nonLinear
      activeStep={activeStep}
      connector={<PremiumConnector />}
    >
        {steps.map((label, index) => {
          const isCompleted = maxStepReached > index;
          const isClickable = maxStepReached >= index && index !== 0;

          return (
            <Step key={label} completed={isCompleted}>
              <StepLabel
                StepIconComponent={PremiumStepIcon}
                onClick={() => {
                  if (isClickable) {
                    setActiveStep(index);
                  }
                }}
                style={{
                  cursor: isClickable ? "pointer" : "default",
                }}
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
        </Stepper>
  </div>
</div>
      <div className="mt-12">
        {activeStep === 0 && <Step1Personal {...props} />}
        {activeStep === 1 && <Step2Professional {...props} />}
        {activeStep === 2 && <Step3Clinic {...props} />}
        {activeStep === 3 && <Step4Practice {...props} />}
        {activeStep === 4 && <Step5Consultation {...props} />}
        {activeStep === 5 && <Step6Documents {...props} />}
        {activeStep === 6 && <Step7Declaration {...props} />}
      </div>
    </div>
  );
};

export default DoctorRegistration;