






import { useState } from 'react';
import appConfig from '../../config/AppConfig';
import Step1_ContactOTP from '../../components/auth/Step1';
import Step2_PersonalInfo from '../../components/auth/Step2';
import ProgressBar from '../../components/auth/ProgressBar';
import Step3_AdditionalInfo from '../../components/auth/Step3';


export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    contactType: 'email',
    email: '',
    phoneNumber: '',
    otp: '',
    isVerified: false,

    firstName: '',
    lastName: '',
    username: '',
    alternateContact: '',
    state: '',
    lga: '',
    dateOfBirth: '',
    role: 'user',
    profilePicture: '',
    password: '',
  });

  const updateForm = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-120">
        <div className="text-center mb-10">
          <div 
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: `linear-gradient(to bottom right, ${appConfig.colors.primary}, ${appConfig.colors.primaryLight})` }}
          >
            <span className="text-4xl">🎥</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Join {appConfig.name}</h1>
          <p className="text-gray-600 mt-2">Create your account in 3 easy steps</p>
        </div>

        <ProgressBar step={step} totalSteps={3} />

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {step === 1 && <Step1_ContactOTP formData={formData} updateForm={updateForm} nextStep={nextStep} />}
          {step === 2 && <Step2_PersonalInfo formData={formData} updateForm={updateForm} nextStep={nextStep} prevStep={prevStep} />}
          {step === 3 && <Step3_AdditionalInfo formData={formData} updateForm={updateForm} prevStep={prevStep} />}
        </div>
      </div>
    </div>
  );
}