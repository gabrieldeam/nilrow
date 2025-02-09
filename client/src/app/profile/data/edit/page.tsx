'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  memo,
  FormEvent,
  ChangeEvent,
} from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

import MobileHeader from '../../../../components/Layout/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Layout/SubHeader/SubHeader';
import CustomInput from '../../../../components/UI/CustomInput/CustomInput';
import DateInput from '../../../../components/UI/DateInput/DateInput';
import Card from '../../../../components/UI/Card/Card';
import StageButton from '../../../../components/UI/StageButton/StageButton';
import Notification from '../../../../components/UI/Notification/Notification';
import CodeInput from '../../../../components/UI/CodeInput/CodeInput';
import LoadingSpinner from '../../../../components/UI/LoadingSpinner/LoadingSpinner';

import { getUserProfile, updateUserProfile } from '../../../../services/profileService';
import { sendResetCode, resetPassword } from '../../../../services/authService';

import styles from './editData.module.css';

function validatePassword(password: string): string | null {
  const specialCharRegex = /[!@#$%^&*()]/;
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /\d/;
  const minLength = 8;
  const maxLength = 20;

  if (!specialCharRegex.test(password)) {
    return 'A senha deve conter pelo menos um caractere especial (!@#$%^&*()).';
  }
  if (!uppercaseRegex.test(password)) {
    return 'A senha deve conter pelo menos uma letra maiúscula.';
  }
  if (!lowercaseRegex.test(password)) {
    return 'A senha deve conter pelo menos uma letra minúscula.';
  }
  if (!numberRegex.test(password)) {
    return 'A senha deve conter pelo menos um número.';
  }
  if (password.length < minLength || password.length > maxLength) {
    return `A senha deve ter entre ${minLength} e ${maxLength} caracteres.`;
  }
  return null;
}

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*()]/.test(password)) strength += 1;
  return strength;
}

function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return 'Péssimo';
    case 2:
      return 'Fraco';
    case 3:
      return 'Bom';
    case 4:
      return 'Forte';
    case 5:
      return 'Excelente';
    default:
      return '';
  }
}

function EditDataPage() {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
  });
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userProfile = await getUserProfile();
        setFormData({
          name: userProfile.name || '',
          cpf: userProfile.cpf || '',
          birthDate: userProfile.birthDate || '',
        });
        setOriginalData({
          name: userProfile.name || '',
          cpf: userProfile.cpf || '',
          birthDate: userProfile.birthDate || '',
        });
        setEmail(userProfile.email);
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
      }
    };
    fetchUserData();
  }, []);

  // Atualiza isFormValid
  useEffect(() => {
    const { name, cpf, birthDate } = formData;
    setIsFormValid(name !== '' && cpf !== '' && birthDate !== '');
  }, [formData]);

  // Navigation "voltar"
  const handleBack = useCallback(() => {
    router.back(); // substitui navigate(-1)
  }, [router]);

  // Handlers de input
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleDateFieldChange = useCallback((event: { target: { name: string; value: string } }) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmail(e.target.value);
  }, []);

  // Submit do formulário de dados pessoais
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');

      if (!isFormValid) {
        setError('Por favor, preencha todos os campos.');
        setShowNotification(true);
        return;
      }

      const updatedProfileData = {
        name: formData.name !== originalData.name ? formData.name : undefined,
        cpf: formData.cpf !== originalData.cpf ? formData.cpf : undefined,
        birthDate: formData.birthDate !== originalData.birthDate ? formData.birthDate : undefined,
      };      

      try {
        await updateUserProfile(updatedProfileData);
        setSuccessMessage('Dados atualizados com sucesso!');
        setShowNotification(true);
      } catch (err: any) {
        console.error('Erro ao atualizar dados:', err);
        setError(
          err.response?.data?.message ||
            'Erro ao atualizar dados. Tente novamente.'
        );
        setShowNotification(true);
      }
    },
    [isFormValid, formData, originalData]
  );

  const handleResetPassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');

      if (!resetCode || !newPassword) {
        setError('Por favor, preencha todos os campos.');
        setShowNotification(true);
        return;
      }

      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setError(passwordError);
        setShowNotification(true);
        return;
      }

      setLoading(true);
      try {
        await resetPassword({ email, token: resetCode, newPassword });
        setSuccessMessage('Senha redefinida com sucesso.');
        setShowNotification(true);
      } catch (err) {
        console.error(err);
        setError(
          'Erro ao redefinir senha. Verifique o código e tente novamente.'
        );
        setShowNotification(true);
      } finally {
        setLoading(false);
      }
    },
    [email, resetCode, newPassword]
  );

  const handleResendCode = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        await sendResetCode(email);
        setSuccessMessage('Novo código de redefinição enviado para o seu e-mail.');
        setShowNotification(true);
      } catch (err) {
        console.error(err);
        setError(
          'Erro ao enviar novo código de redefinição. Verifique o e-mail e tente novamente.'
        );
        setShowNotification(true);
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const handleNewPasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newPass = e.target.value;
      setNewPassword(newPass);
      setPasswordStrength(calculatePasswordStrength(newPass));
    },
    []
  );

  return (
    <div className={styles['edit-data-page']}>
      <Head>
        <title>Editar Dados - Nilrow</title>
        <meta name="description" content="Edite seu perfil na Nilrow." />
      </Head>

      {showNotification && (
        <Notification
          message={error || successMessage}
          onClose={() => setShowNotification(false)}
          backgroundColor={error ? '#DF1414' : '#4FBF0A'}
        />
      )}
      {loading && <LoadingSpinner />}

      {/* MOBILE HEADER (se for mobile) */}
      {isMobile && (
        <MobileHeader
          title="Editar dados"
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles['edit-data-container']}>
        <SubHeader title="Editar dados" handleBack={handleBack} />
        <form onSubmit={handleSubmit}>
          <Card title="Alterar">
            <CustomInput
              title="Nome completo"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <CustomInput
              title="CPF"
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
            />
            <DateInput
              name="birthDate"
              value={formData.birthDate}
              onChange={handleDateFieldChange}
              bottomLeftText="Sua data de nascimento não será divulgada."
            />
          </Card>

          <div
            style={{ width: '100%' }}
            className={styles['confirmationButton-space']}
          >
            <StageButton
              text="Editar dados"
              backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
              type="submit"
              disabled={!isFormValid}
            />
          </div>
        </form>

        <form onSubmit={handleResetPassword}>
          <Card title="Redefinir Senha">
            <CustomInput
              title="E-mail"
              value={email}
              type="email"
              onChange={handleEmailChange}
              disabled
            />

            <label className="input-title">Código de Redefinição</label>
            <CodeInput
              length={6}
              onChange={(value) => setResetCode(value)}
            />

            <StageButton
              text="Enviar novo código"
              backgroundColor="#7B33E5"
              onClick={handleResendCode}
            />

            <CustomInput
              title="Nova Senha"
              onChange={handleNewPasswordChange}
              value={newPassword}
              type="password"
            />
            <div className={styles['password-data-strength-bar']}>
              <div className={`strength-${passwordStrength}`}></div>
            </div>
            <div className={styles['password-data-strength-label']}>
              {getPasswordStrengthLabel(passwordStrength)}
            </div>
          </Card>

          <div className={styles['confirmationButton-space']}>
            <StageButton
              text="Redefinir Senha"
              backgroundColor="#7B33E5"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(EditDataPage);
