import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'calc(100vh - 70px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', background:'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(99,102,241,.08), transparent), radial-gradient(ellipse 60% 50% at 70% 50%, rgba(34,211,165,.06), transparent)' }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div className="card" style={{ position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--accent),var(--accent2))' }} />
          <div style={{ padding:40 }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, marginBottom:6 }}>Welcome back 👋</h2>
            <p style={{ color:'var(--muted)', fontSize:14, marginBottom:28 }}>Login to your CrowdAid account</p>

            {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop:8 }}>
                {loading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Logging in...</> : 'Login to CrowdAid'}
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--muted)' }}>
              Don't have an account? <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}