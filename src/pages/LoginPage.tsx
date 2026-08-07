// pages/LoginPage.tsx
import { useState, type FormEvent } from 'react';
import { Building2, Mail, Lock } from 'lucide-react';
import { toast } from '../components/ui/toast/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { Button } from '@/components/ui/Button';
// import { toast } from '@/lib/toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // await authService.login({ email, password, rememberMe });
      toast.success('Signed in successfully');
    } catch (err: any) {
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-page">
      {/* Left panel — brand side, hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        {/* Blueprint grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 size={20} aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Civil Mind Pro</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-3xl font-semibold leading-tight mb-4">
              Run every construction project from one place.
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Track budgets, timelines, and site progress across all your projects —
              built for civil engineers who need clarity, not clutter.
            </p>
          </div>

          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} Civil Mind Pro. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Building2 size={20} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold text-heading tracking-tight">
              Civil Mind Pro
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-heading mb-1.5">Welcome back</h2>
          <p className="text-sm text-muted mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              leftIcon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-body cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                Remember me
              </label>

              <a
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary-hover font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} loadingText="Signing in...">
              Sign in
            </Button>
          </form>

          <p className="text-sm text-muted text-center mt-8">
            Don't have an account?{' '}

            <a href="/signup"
              className="text-primary hover:text-primary-hover font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
            >

              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}