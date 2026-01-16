import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { toast } from 'sonner';

// Import the logo
import logoSvg from '@/assets/baines-logo-full.svg';

export default function Auth() {
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleForgotPassword = () => {
    toast.info('Password Reset', {
      description: 'Please contact your administrator to reset your password.',
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Auth Form */}
      <div className="w-full lg:w-[60%] flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-32 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={logoSvg} 
              alt="GoodDoc Logo" 
              className="h-10 w-auto"
            />
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Welcome back to GoodDoc
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue
            </p>
          </div>

          {/* Login Form */}
          <LoginForm onForgotPassword={handleForgotPassword} />
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:block lg:w-[40%] relative">
        <img
          src="/images/auth-side.jpg"
          alt="GoodDoc preview"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a gradient background if image is missing
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.style.background = 
                'linear-gradient(135deg, hsl(218 80% 50%) 0%, hsl(174 100% 36%) 100%)';
            }
          }}
        />
        {/* Overlay gradients for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Hospital Management Simplified
          </h2>
          <p className="text-white/80 text-sm">
            Streamline your hospital operations with GoodDoc's comprehensive management platform.
          </p>
        </div>
      </div>
    </div>
  );
}
