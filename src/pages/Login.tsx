import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { S } from '../styles/theme';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.authBox as React.CSSProperties}>
      <div style={S.authCard as React.CSSProperties}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={S.logoDot} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#f0ede8' }}>Trace It</span>
        </div>
        <h2 style={S.authTitle as React.CSSProperties}>Welcome back</h2>
        <p style={S.authSub as React.CSSProperties}>Sign in to post and manage items.</p>

        <form onSubmit={handleLogin}>
          <div style={S.formRow as React.CSSProperties}>
            <label style={S.label as React.CSSProperties}>Email</label>
            <input
              style={S.input as React.CSSProperties}
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={S.formRow as React.CSSProperties}>
            <label style={S.label as React.CSSProperties}>Password</label>
            <input
              style={S.input as React.CSSProperties}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ background: '#2a1818', border: '1px solid #3a2828', color: '#e8533a', padding: '10px 12px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...S.btnPrimary, width: '100%', padding: '11px', marginTop: 8, fontSize: 14, opacity: loading ? 0.5 : 1 } as React.CSSProperties}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <hr style={S.divider as React.CSSProperties} />
        <div style={{ textAlign: 'center', fontSize: 12, color: '#555' }}>
          No account?{' '}
          <Link to="/signup" style={{ color: '#e8533a', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;