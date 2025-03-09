import { SignupProvider } from '@/context/SignupContext';

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <SignupProvider>
      {children}
    </SignupProvider>
  );
}
