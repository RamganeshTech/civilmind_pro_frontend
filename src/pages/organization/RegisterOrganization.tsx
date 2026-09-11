import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Mail, Lock, User, Phone, ArrowRight, 
  ArrowLeft, CheckCircle2 
} from 'lucide-react';
import { toast } from '../../components/ui/toast/Toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useRegisterOrganization } from '../../api_service/organization_api/organizationapi';

export default function RegisterOrganization() {
  const navigate = useNavigate();
  const { mutateAsync: registerOrgAsync, isPending } = useRegisterOrganization();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    password: '',
    organizationName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error for the field being typed in
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateStep1 = () => {
    const nextErrs: Record<string, string> = {};
    if (!formData.userName.trim()) nextErrs.userName = 'Full name is required';
    if (!formData.email.trim()) nextErrs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) nextErrs.email = 'Invalid email address';
    if (!formData.password) nextErrs.password = 'Password is required';
    else if (formData.password.length < 6) nextErrs.password = 'Password must be at least 6 characters';
    
    setErrors(nextErrs);
    return Object.keys(nextErrs).length === 0;
  };

  const validateStep2 = () => {
    const nextErrs: Record<string, string> = {};
    if (!formData.organizationName.trim()) nextErrs.organizationName = 'Company name is required';
    
    setErrors(nextErrs);
    return Object.keys(nextErrs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      await registerOrgAsync(formData);
      toast.success('Organization created successfully! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to register organization');
    }
  };

  return (
    <div className="min-h-screen flex bg-page">
      {/* --- Left Panel (Brand & Steps) --- */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-primary overflow-hidden flex-col justify-between p-12 text-white">
        {/* Blueprint grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 size={20} aria-hidden="true" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Civil Mind Pro</span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight mb-8">
            Let's set up your workspace.
          </h1>

          {/* Progress Tracker */}
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/20 before:to-transparent">
            {/* Step 1 Indicator */}
            <div className="relative flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${step === 2 ? 'bg-success border-success text-white' : 'bg-primary border-white text-white'}`}>
                {step === 2 ? <CheckCircle2 size={16} /> : <span className="text-sm font-medium">1</span>}
              </div>
              <div>
                <h3 className={`font-medium ${step >= 1 ? 'text-white' : 'text-white/50'}`}>Your Details</h3>
                <p className="text-sm text-white/60">Name, email, and password</p>
              </div>
            </div>

            {/* Step 2 Indicator */}
            <div className="relative flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${step === 2 ? 'bg-primary border-white text-white' : 'bg-primary border-white/30 text-white/30'}`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <div>
                <h3 className={`font-medium ${step === 2 ? 'text-white' : 'text-white/50'}`}>Organization</h3>
                <p className="text-sm text-white/60">Company and workspace name</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-white/50">
          © {new Date().getFullYear()} Civil Mind Pro. All rights reserved.
        </p>
      </div>

      {/* --- Right Panel (Form) --- */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          
          {/* Mobile-only header */}
          <div className="flex lg:hidden flex-col mb-8">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Building2 size={20} className="text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-semibold text-heading tracking-tight">
                Civil Mind Pro
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
              Step {step} of 2
            </div>
          </div>

          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-semibold text-heading mb-1.5">Create your account</h2>
              <p className="text-sm text-muted mb-8">
                Enter your personal details to get started as the workspace owner.
              </p>

              <div className="space-y-5">
                <Input
                  label="Full Name *"
                  name="userName"
                  type="text"
                  placeholder="John Doe"
                  leftIcon={<User size={18} />}
                  value={formData.userName}
                  onChange={handleChange}
                  error={errors.userName}
                />
                
                <Input
                  label="Email Address *"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  leftIcon={<Mail size={18} />}
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                
                <Input
                  label="Phone Number (Optional)"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  leftIcon={<Phone size={18} />}
                  value={formData.phone}
                  onChange={handleChange}
                />

                <Input
                  label="Password *"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  leftIcon={<Lock size={18} />}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />

                <Button 
                  type="button" 
                  fullWidth 
                  rightIcon={<ArrowRight size={18} />}
                  onClick={handleNext}
                  className="mt-4"
                >
                  Continue to Workspace
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-semibold text-heading mb-1.5">Setup Workspace</h2>
              <p className="text-sm text-muted mb-8">
                Name your organization. You can invite team members later.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Organization / Company Name *"
                  name="organizationName"
                  type="text"
                  placeholder="e.g. Apex Construction Ltd."
                  leftIcon={<Building2 size={18} />}
                  value={formData.organizationName}
                  onChange={handleChange}
                  error={errors.organizationName}
                />

                <div className="flex items-center gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                    className="px-4"
                  >
                    <ArrowLeft size={18} />
                  </Button>
                  <Button 
                    type="submit" 
                    fullWidth 
                    isLoading={isPending} 
                    loadingText="Creating Workspace..."
                  >
                    Create Workspace
                  </Button>
                </div>
              </form>
            </div>
          )}

          <p className="text-sm text-muted text-center mt-8">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Sign in here
            </button>
          </p>
          
        </div>
      </div>
    </div>
  );
}