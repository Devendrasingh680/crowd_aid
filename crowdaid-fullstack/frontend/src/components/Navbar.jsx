import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'16px 32px', borderBottom:'1px solid var(--border)',
      background:'rgba(11,15,26,.92)', backdropFilter:'blur(14px)',
      position:'sticky', top:0, zIndex:200,
    }}>
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22 }}>
        <span style={{ width:10, height:10, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />
        Crowd<span style={{ color:'var(--accent)' }}>Aid</span>
      </Link>

      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <Link to="/browse" className="btn btn-ghost" style={{ padding:'8px 16px' }}>Browse</Link>

        {!user ? (
          <>
            <Link to="/login" className="btn btn-ghost" style={{ padding:'8px 16px' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding:'8px 16px' }}>Join Free</Link>
          </>
        ) : (
          <>
            {user.role === 'creator' && (
              <Link to="/submit" className="btn btn-primary" style={{ padding:'8px 16px' }}>+ Campaign</Link>
            )}
            <div style={{ position:'relative' }}>
              <div
                onClick={() => setMenuOpen(v => !v)}
                style={{
                  width:36, height:36, borderRadius:'50%', cursor:'pointer',
                  background:'linear-gradient(135deg,var(--accent),var(--accent2))',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, color:'#0b0f1a',
                }}
              >
                {user.name[0].toUpperCase()}
              </div>
              {menuOpen && (
                <div style={{
                  position:'absolute', top:'calc(100% + 10px)', right:0,
                  background:'var(--bg2)', border:'1px solid var(--border2)',
                  borderRadius:14, padding:8, minWidth:200, zIndex:300,
                  boxShadow:'var(--shadow)',
                }}>
                  <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', marginBottom:6 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{user.name}</div>
                    <div style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize', marginTop:2 }}>{user.role}</div>
                  </div>
                  {[
                    { to: user.role==='admin' ? '/admin' : '/dashboard', label:'📊 Dashboard' },
                    ...(user.role==='creator' ? [{ to:'/submit', label:'🚀 New Campaign' }] : []),
                    { to:'/dashboard', label:'👤 My Profile' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                      style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:8, fontSize:13, color:'var(--muted)', transition:'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.color='var(--text)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='var(--muted)'; }}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ height:1, background:'var(--border)', margin:'6px 0' }} />
                  <button onClick={handleLogout}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:8, fontSize:13, color:'var(--red)', width:'100%', background:'none', border:'none', cursor:'pointer', transition:'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,.1)'}
                    onMouseLeave={e => e.currentTarget.style.background=''}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}