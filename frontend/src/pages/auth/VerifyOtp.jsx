import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate('/signup', { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[idx] = value.slice(-1);
    setDigits(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputsRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp({ email, otp });
      toast.success('Email verified! Please log in to continue.');
      navigate('/login');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp({ email });
      toast.success('A new code has been sent to your email.');
      setCooldown(30);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-3xl mb-2">Verify Your Email</h1>
      <p className="text-brown-light mb-8">
        We've sent a 6-digit code to <span className="text-brown-deep font-medium">{email}</span>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2.5 justify-center mb-8" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="w-12 h-14 text-center text-xl font-label font-semibold rounded-2xl border border-beige-dark focus:outline-none focus:ring-2 focus:ring-rose/40 focus:border-rose"
            />
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
          {loading ? 'Verifying…' : 'Verify Email'}
        </button>
      </form>

      <p className="text-center text-sm text-brown-light mt-8">
        Didn't receive the code?{' '}
        <button onClick={handleResend} disabled={resending || cooldown > 0} className="text-rose-dark font-medium hover:underline disabled:opacity-50 disabled:no-underline">
          {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend Code'}
        </button>
      </p>

      <p className="text-center text-sm text-brown-light mt-2">
        <Link to="/login" className="hover:underline">Back to login</Link>
      </p>
    </motion.div>
  );
};

export default VerifyOtp;
