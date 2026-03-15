import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'', role:'donor' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const user = await register({ name:form.name, email:form.email, phone:form.phone, password:form.password, role:form.role });
      toast(`Account created! Welcome to CrowdAid, ${user.name.split(' ')[0]}! 🎉`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'calc(100vh - 70px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', background:'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(99,102,241,.08), transparent)' }}>
      <div style={{ width:'100%', maxWidth:480 }}>
        <div className="card" style={{ position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--accent),var(--accent2))' }} />
          <div style={{ padding:40 }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, marginBottom:6 }}>Join CrowdAid 🌟</h2>
            <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24 }}>Create your free account in seconds</p>

            {/* Role toggle */}
            <div style={{ display:'flex', gap:8, marginBottom:24 }}>
              {[['donor','💝 I want to Donate'],['creator','🚀 I need Funds']].map(([r,l]) => (
                <button key={r} type="button" onClick={() => setForm(f => ({...f,role:r}))}
                  style={{ flex:1, padding:'11px 8px', border:`1px solid ${form.role===r?'var(--accent)':'var(--border2)'}`, borderRadius:'var(--radius-sm)', background: form.role===r?'rgba(34,211,165,.1)':'transparent', color: form.role===r?'var(--accent)':'var(--muted)', cursor:'pointer', fontSize:13, fontWeight: form.role===r?700:400, transition:'all .2s' }}>
                  {l}
                </button>
              ))}
            </div>

            {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="Rahul Sharma" value={form.name} onChange={set('name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" placeholder="Min. 6 chars" value={form.password} onChange={set('password')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input className="form-input" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop:8 }}>
                {loading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Creating account...</> : `Create ${form.role==='donor'?'Donor':'Creator'} Account`}
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--muted)' }}>
              Already have an account? <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}