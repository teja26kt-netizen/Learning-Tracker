import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, User, KeyRound, AlertCircle } from 'lucide-react';
import Logo from '../components/brand/Logo';
import { formatApiError } from '../utils/apiErrors';
import { warmApi } from '../utils/warmApi';
import { getHomePath } from '../utils/authSession';
import { prefetchDashboard } from '../utils/prefetchDashboard';
import API from '../services/api';

const Login = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    const { user, verifyOtpLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate(getHomePath(user), { replace: true });
    }, [user, navigate]);

    useEffect(() => {
        warmApi();
    }, []);

    const goToApp = (session) => {
        if (!session?.isAdmin) prefetchDashboard();
        navigate(getHomePath(session), { replace: true });
    };

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        setError('');
        setSendingOtp(true);
        const payload = { email: email.trim() };
        const request = () => API.post('auth/send-otp', payload, { timeout: 60000 });
        try {
            let data;
            try {
                ({ data } = await request());
            } catch (err) {
                const isColdStart =
                    err?.code === 'ECONNABORTED' ||
                    err?.code === 'ERR_NETWORK' ||
                    /timeout|network/i.test(err?.message || '');
                if (!isColdStart) throw err;
                setError('Server is waking up — retrying…');
                ({ data } = await request());
            }
            setOtpSent(true);
            setIsNewUser(Boolean(data.isNewUser));
            setError(data.mock ? 'Dev mode: check server logs for the OTP code.' : '');
        } catch (err) {
            setError(formatApiError(err, 'Could not send OTP. Please try again.'));
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (isNewUser && !name.trim()) {
            setError('Please enter your name.');
            return;
        }
        setLoading(true);
        try {
            const session = await verifyOtpLogin({
                email: email.trim(),
                otp: otp.trim(),
                name: name.trim(),
            });
            goToApp(session);
        } catch (err) {
            setError(formatApiError(err, 'Invalid OTP. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40 flex items-center justify-center px-4 py-12 max-md:min-h-[100dvh]">
            <div className="w-full max-w-md min-w-0">
                <p className="text-center mb-4">
                    <button type="button" onClick={() => navigate('/')} className="text-sm font-semibold text-slate-500 hover:text-violet-600">
                        ← Back to home
                    </button>
                </p>
                <div className="text-center mb-8">
                    <Logo className="w-14 h-14 mb-4 shadow-xl shadow-sky-200/80 rounded-2xl mx-auto" />
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {otpSent ? 'Enter OTP' : 'Welcome'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium break-all px-2">
                        {otpSent
                            ? `Code sent to ${email.trim()}`
                            : 'Sign in with your email'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 p-5 sm:p-8 space-y-5">
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!otpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="login-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={sendingOtp || !email.trim()}
                                className="w-full h-12 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-2"
                            >
                                {sendingOtp ? (
                                    <>
                                        <span className="sm:hidden">Sending…</span>
                                        <span className="hidden sm:inline">Sending OTP… (may take up to a minute)</span>
                                    </>
                                ) : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            {isNewUser && (
                                <div className="space-y-1.5">
                                    <label htmlFor="login-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Your name
                                    </label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="login-name"
                                            type="text"
                                            required
                                            placeholder="Your name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label htmlFor="login-otp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    OTP
                                </label>
                                <div className="relative">
                                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="login-otp"
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        maxLength={6}
                                        placeholder="6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otp.length < 4}
                                className="w-full h-12 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Verifying…' : 'Continue →'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setOtpSent(false);
                                    setOtp('');
                                    setError('');
                                }}
                                className="w-full text-sm font-semibold text-slate-500 hover:text-violet-600"
                            >
                                Change email
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
                    You stay signed in on this device. Set your <strong>reminder time</strong> in Settings and turn the <strong>bell ON</strong> on daily goals.
                </p>
            </div>
        </div>
    );
};

export default Login;
