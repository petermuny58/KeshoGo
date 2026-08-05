import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Lock } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useToast } from '../context/ToastContext';

export function SignUp() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 9 && password.trim().length >= 4;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh_-_64px)] max-w-sm flex-col items-center justify-center px-6 py-10">
      <Logo variant="full" className="h-28 w-auto" />

      <h1 className="mt-2 text-xl font-semibold text-graphite">Create your account</h1>
      <p className="mt-1 text-center text-sm text-graphite-muted">Join shoppers across Zambia buying and selling on KeshoGo.</p>

      <form
        className="mt-7 flex w-full flex-col gap-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          showToast('Account created — welcome to KeshoGo!', 'success');
          navigate('/');
        }}
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-graphite-muted">Full name</span>
          <div className="relative">
            <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-muted" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chanda Mwape"
              className="h-12 w-full rounded-full border border-border-soft pl-10 pr-4 text-sm focus:border-primary"
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-graphite-muted">Phone number</span>
          <div className="relative">
            <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-muted" />
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="097 000 0000"
              className="h-12 w-full rounded-full border border-border-soft pl-10 pr-4 text-sm focus:border-primary"
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-graphite-muted">Password</span>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              className="h-12 w-full rounded-full border border-border-soft pl-10 pr-4 text-sm focus:border-primary"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 h-12 w-full rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-40"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-sm text-graphite-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary">Log in</Link>
      </p>
    </div>
  );
}
