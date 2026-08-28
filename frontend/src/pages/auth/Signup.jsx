import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import authService from '../../services/authService';

const initialForm = {
  fullName: '', email: '', contactNumber: '', password: '', confirmPassword: '', acceptedTerms: false,
};

const Signup = () => {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!form.acceptedTerms) {
      toast.error('Please accept the Terms & Conditions to continue.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signup(form);
      toast.success('Account created! Check your email for the verification code.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-3xl mb-2">Join the Nest</h1>
      <p className="text-brown-light mb-8">Create your account to start shopping cozy handmade crochet.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" />
          <input required placeholder="Full Name" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className="input-cozy pl-11" />
        </div>
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" />
          <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="input-cozy pl-11" />
        </div>
        <div className="relative">
          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" />
          <input required placeholder="Contact Number" value={form.contactNumber} onChange={(e) => handleChange('contactNumber', e.target.value)} className="input-cozy pl-11" />
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" />
          <input
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="Password (min. 8 characters)"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
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
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="input-cozy pl-11"
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-brown-light cursor-pointer">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(e) => handleChange('acceptedTerms', e.target.checked)}
            className="mt-0.5 rounded accent-rose"
          />
          I agree to the <Link to="/terms" className="text-rose-dark hover:underline">Terms &amp; Conditions</Link> and{' '}
          <Link to="/privacy-policy" className="text-rose-dark hover:underline">Privacy Policy</Link>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-brown-light mt-8">
        Already have an account? <Link to="/login" className="text-rose-dark font-medium hover:underline">Log in</Link>
      </p>
    </motion.div>
  );
};

export default Signup;
