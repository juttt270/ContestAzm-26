import { useState } from 'react';
import { ArrowLeft, KeyRound, Mail, Check, Eye, EyeOff, User, Lock, Phone } from 'lucide-react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validatePasswordMatch,
} from '@/utils/validators';

export default function Login() {
  const { login, signup, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password, 1);
    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      return;
    }
    setFieldErrors({});
    setIsLoading(true);
    try {
      await login(email, password);
      setLoginSuccess(true);
      setTimeout(() => navigate(ROUTES.DASHBOARD), 900);
    } catch (err) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const passErr = validatePassword(password, 6);
    const matchErr = validatePasswordMatch(password, confirmPassword);

    if (nameErr || emailErr || phoneErr || passErr || matchErr) {
      setFieldErrors({
        name: nameErr,
        email: emailErr,
        phone: phoneErr,
        password: passErr,
        confirmPassword: matchErr,
      });
      return;
    }
    setFieldErrors({});
    setIsLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
      setRegisterSuccess(true);
      setTimeout(() => navigate(ROUTES.DASHBOARD), 1200);
    } catch (err) {
      setError(err.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-white selection:text-black">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full min-h-screen relative">
        <div
          className={`absolute top-0 bottom-0 w-full lg:w-[40%] min-h-screen p-6 sm:p-8 md:p-10 z-20 bg-[#07090c]/85 backdrop-blur-3xl flex flex-col justify-between transition-all duration-700 ease-in-out overflow-y-auto no-scrollbar ${
            isRegister ? 'left-0 lg:left-[60%] border-l border-white/5' : 'left-0 border-r border-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-all text-xs font-semibold uppercase tracking-wider group cursor-pointer no-underline"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Home</span>
            </Link>
            <img
              src="/logo.png"
              alt="SmartSociety"
              className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
          </div>

          <div className="my-auto py-8 max-w-md w-full mx-auto">
            {loginSuccess && (
              <div className="text-center py-10 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Login Successful</h2>
                <p className="text-white/60 text-sm max-w-xs mx-auto">Welcome back! Redirecting you to your dashboard...</p>
                <div className="w-12 h-1 bg-white/10 mx-auto rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            )}

            {registerSuccess && (
              <div className="text-center py-10 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Account Created!</h2>
                <p className="text-white/60 text-sm max-w-xs mx-auto">Welcome to SmartSociety. Taking you to your dashboard...</p>
                <div className="w-12 h-1 bg-white/10 mx-auto rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            )}

            {!loginSuccess && !registerSuccess && !isRegister && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-medium tracking-tighter leading-none">
                    Welcome <span className="text-white font-semibold">Back</span>
                  </h1>
                  <p className="text-white/50 text-sm mt-2">Please enter your details to log in to your account.</p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">{error}</div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                        }}
                        placeholder="you@example.com"
                        className={`w-full bg-white/[0.02] border rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.04] transition-all ${
                          fieldErrors.email ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/30'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-400 font-medium pl-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Password</label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                        }}
                        placeholder="Enter your password"
                        className={`w-full bg-white/[0.02] border rounded-xl py-3.5 pl-11 pr-11 text-sm text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.04] transition-all ${
                          fieldErrors.password ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/30'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-[11px] text-red-400 font-medium pl-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-full bg-white text-black font-semibold text-sm hover:bg-[#f4f4f4] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    <span>{isLoading ? 'Signing you in...' : 'Log In'}</span>
                  </button>
                </form>

                <div className="text-center text-xs text-white/40">
                  <span>Don't have an account? </span>
                  <button
                    onClick={() => {
                      setIsRegister(true);
                      setError('');
                      setFieldErrors({});
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer border-0 bg-transparent focus:outline-none transition-colors ml-1"
                  >
                    Sign up here
                  </button>
                </div>
              </div>
            )}

            {!loginSuccess && !registerSuccess && isRegister && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-medium tracking-tighter leading-none">
                    Join Our <span className="text-white font-semibold">Community</span>
                  </h1>
                  <p className="text-white/50 text-sm mt-2">
                    Create your account to access society features, notices, and amenities.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">{error}</div>
                )}

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Your Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                        }}
                        placeholder="Enter your full name (letters only)"
                        className={`w-full bg-white/[0.02] border rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.04] transition-all ${
                          fieldErrors.name ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/30'
                        }`}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="text-[11px] text-red-400 font-medium pl-1">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                        }}
                        placeholder="you@example.com"
                        className={`w-full bg-white/[0.02] border rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.04] transition-all ${
                          fieldErrors.email ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/30'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-400 font-medium pl-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                        }}
                        placeholder="+92 300 1234567"
                        className={`w-full bg-white/[0.02] border rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.04] transition-all ${
                          fieldErrors.phone ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/30'
                        }`}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-red-400 font-medium pl-1">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                        }}
                        placeholder="Create a strong password (min. 6 chars)"
                        className={`w-full bg-white/[0.02] border rounded-xl py-3 pl-11 pr-11 text-xs text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.04] transition-all ${
                          fieldErrors.password ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/30'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-[11px] text-red-400 font-medium pl-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Confirm Password</label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                        }}
                        placeholder="Confirm your password"
                        className={`w-full bg-white/[0.02] border rounded-xl py-3 pl-11 pr-11 text-xs text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.04] transition-all ${
                          fieldErrors.confirmPassword ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/30'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[11px] text-red-400 font-medium pl-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-[#f4f4f4] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  >
                    <span>{isLoading ? 'Creating account...' : 'Register'}</span>
                  </button>
                </form>

                <div className="text-center text-xs text-white/40">
                  <span>Already have an account? </span>
                  <button
                    onClick={() => {
                      setIsRegister(false);
                      setError('');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer border-0 bg-transparent focus:outline-none transition-colors ml-1"
                  >
                    Log In
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/30 pt-4 border-t border-white/5">
            <span>Your security is our priority</span>
            <span>© 2026 SmartSociety</span>
          </div>
        </div>

        <div
          className={`absolute top-0 bottom-0 hidden lg:flex lg:w-[60%] min-h-screen overflow-hidden bg-[#0d0f14] transition-all duration-700 ease-in-out z-10 ${
            isRegister ? 'left-0 lg:left-0' : 'left-0 lg:left-[40%]'
          }`}
        >
          <img
            src="/login-illustration.jpg"
            alt="Smart Society Illustration"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-lighten scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090c] via-[#07090c]/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        </div>
      </div>
    </div>
  );
}
