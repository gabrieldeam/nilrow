import React, { useState } from 'react';
import SignupStep1 from './SignupStep1';
import SignupStep2 from './SignupStep2';
import SignupStep3 from './SignupStep3';
import './Signup.css';
import Header from '../../../components/Auth/Header/Header';
import Footer from '../../../components/Auth/Footer/Footer';

const Signup = () => {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const renderStep = () => {
        switch(step) {
            case 1:
                return <SignupStep1 nextStep={nextStep} />;
            case 2:
                return <SignupStep2 nextStep={nextStep} prevStep={prevStep} />;
            case 3:
                return <SignupStep3 prevStep={prevStep} />;
            default:
                return <SignupStep1 nextStep={nextStep} />;
        }
    };

    return (
        <div className="signup-page">
            <Header />
            <div className="signup-container">
                {renderStep()}
            </div>
            <Footer />
        </div>
    );
};

export default Signup;
