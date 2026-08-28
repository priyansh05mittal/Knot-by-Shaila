import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, CheckCircle2 } from 'lucide-react';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <CheckCircle2 className="mx-auto text-rose mb-4" size={48} />
        <h1 className="text-2xl mb-3">Check Your Email</h1>
        <p className="text-brown-light mb-8">
          If an account exists with <span className="text-brown-deep font-medium">{email}</span>, we've sent a
          password reset link. It expires in 15 minutes.
        </p>
        <Link to="/login" className="btn-primary">Back to Login</Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-3xl mb-2">Forgot Password?</h1>
      <p className="text-brown-light mb-8">Enter your email and we'll send you a link to reset your password.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" />
          <input required type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-cozy pl-11" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-center text-sm text-brown-light mt-8">
        <Link to="/login" className="text-rose-dark font-medium hover:underline">Back to login</Link>
      </p>
    </motion.div>
  );
};

export default ForgotPassword;
