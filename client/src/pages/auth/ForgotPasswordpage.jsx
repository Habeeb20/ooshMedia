import { useNavigate } from 'react-router-dom';
import ForgotPasswordFlow from './Forgotpassword';


export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <ForgotPasswordFlow onComplete={() => navigate('/login')} />
    </div>
  );
}