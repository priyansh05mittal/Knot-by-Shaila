import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, form);
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-3xl mb-2">Reset Your Password</h1>
      <p className="text-brown-light mb-8">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" />
          <input
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="input-cozy pl-11 pr-11"
          />
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brown-light">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" />
          <input
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm New Password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            className="input-cozy pl-11"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>

      <p className="text-center text-sm text-brown-light mt-8">
        <Link to="/login" className="text-rose-dark font-medium hover:underline">Back to login</Link>
      </p>
    </motion.div>
  );
};

export default ResetPassword;
