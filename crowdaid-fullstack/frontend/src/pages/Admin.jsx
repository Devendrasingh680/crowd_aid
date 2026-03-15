import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api';

const fmt = (n) => n >= 100000 ? `\u20b9${(n/100000).toFixed(1)}L` : `\u20b9${(n/1000).toFixed(1)}K`;

export default function Admin() {
  const { user } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const [tab,       setTab]       = useState('pending');
  const [stats,     setStats]     = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [users,     setUsers]     = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
  }, [user]);

  const load = async (t) => {
    setLoading(true);
    try {
      if (t === 'pending') {
        // Use status=pending which backend maps to $in: ['pending','manual_review']
        const { data } = await API.get('/admin/campaigns?status=pending');
        setCampaigns(data.campaigns);
      } else if (t === 'all') {
        const { data } = await API.get('/admin/campaigns');
        setCampaigns(data.campaigns);
      } else if (t === 'stats') {
        const { data } = await API.get('/admin/stats');
        setStats(data.stats);
      } else if (t === 'users') {
        const { data } = await API.get('/admin/users');
        setUsers(data.users);
      } else if (t === 'donations') {
        const { data } = await API.get('/admin/donations');
        setDonations(data.donations);
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load data.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const updateStatus = async (id, status, reason = '') => {
    try {
      await API.put(`/admin/campaigns/${id}/status`, { status, rejectionReason: reason });
      toast(`Campaign ${status}!`);
      setCampaigns(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      toast(err.response?.data?.message || 'Action failed.', 'error');
    }
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/toggle`);
      toast(data.message);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
    } catch (err) {
      toast(err.response?.data?.message || 'Failed.', 'error');
    }
  };

  const sideLinks = [
    ['pending',   '⏳', 'Pending Review'],
    ['all',       '📋', 'All Campaigns'],
    ['users',     '👥', 'Users'],
    ['donations', '💰', 'Donations'],
    ['stats',     '📊', 'Stats'],
  ];

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'calc(100vh - 70px)' }}>
      {/* Sidebar */}
      <div style={{ background:'var(--bg2)', borderRight:'1px solid var(--border)', padding:'24px 0' }}>
        <div style={{ padding:'0 16px 20px', borderBottom:'1px solid var(--border)', marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent2),var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:'#0b0f1a', marginBottom:10 }}>
            {user.name[0]}
          </div>
          <div style={{ fontWeight:600 }}>{user.name}</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>ADMIN</div>
        </div>
        <div style={{ padding:'0 16px' }}>
          {sideLinks.map(([id, icon, label]) => (
            <div key={id} onClick={() => setTab(id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, cursor:'pointer', fontSize:14, marginBottom:2, transition:'all .2s',
                color: tab===id ? 'var(--accent)' : 'var(--muted)',
                background: tab===id ? 'rgba(34,211,165,.08)' : 'transparent',
                border: tab===id ? '1px solid rgba(34,211,165,.2)' : '1px solid transparent',
              }}>
              {icon} {label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:32, overflowY:'auto' }}>

        {/* PENDING */}
        {tab === 'pending' && (
          <div className="fade-up">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:6 }}>Pending Review</h2>
            <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24 }}>Campaigns waiting for manual verification</p>
            {loading
              ? <div className="spinner spinner-lg" style={{ margin:'40px auto', display:'block' }} />
              : campaigns.length === 0
                ? <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>🎉 No pending campaigns!</div>
                : campaigns.map(c => (
                  <div key={c._id} className="card" style={{ padding:22, marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:6 }}>{c.emoji} {c.title}</div>
                        <span className={`badge status-${c.status === 'manual_review' ? 'review' : 'pending'}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize:12, color:'var(--muted)', marginLeft:10 }}>by {c.creator?.name}</span>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:14, color:'var(--accent)', fontWeight:700 }}>AI Score: {c.aiScore}%</div>
                        <div style={{ fontSize:12, color:'var(--muted)' }}>Goal: {fmt(c.targetAmount)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6, marginBottom:14 }}>
                      {c.story?.slice(0, 160)}...
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button
                        className="btn btn-sm"
                        style={{ background:'rgba(34,211,165,.15)', color:'var(--accent)', border:'1px solid rgba(34,211,165,.3)' }}
                        onClick={() => updateStatus(c._id, 'approved')}
                      >✓ Approve</button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          const reason = window.prompt('Reason for rejection (required):');
                          if (reason && reason.trim()) updateStatus(c._id, 'rejected', reason.trim());
                        }}
                      >✕ Reject</button>
                    </div>
                  </div>
                ))
            }
          </div>
        )}

        {/* ALL CAMPAIGNS */}
        {tab === 'all' && (
          <div className="fade-up">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>All Campaigns</h2>
            {loading
              ? <div className="spinner spinner-lg" style={{ margin:'40px auto', display:'block' }} />
              : <div className="card">
                  <table className="table">
                    <thead><tr><th>Title</th><th>Category</th><th>Score</th><th>Raised</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {campaigns.map(c => (
                        <tr key={c._id}>
                          <td style={{ fontWeight:600 }}>{c.emoji} {c.title?.slice(0, 35)}...</td>
                          <td><span className="badge badge-purple">{c.category}</span></td>
                          <td style={{ color:'var(--accent)', fontWeight:700 }}>{c.aiScore}%</td>
                          <td>{fmt(c.raisedAmount)}</td>
                          <td>
                            <span className={`badge status-${c.status === 'approved' ? 'approved' : c.status === 'rejected' ? 'rejected' : c.status === 'manual_review' ? 'review' : 'pending'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            {c.status !== 'approved' && (
                              <button className="btn btn-sm" style={{ background:'rgba(34,211,165,.15)', color:'var(--accent)', marginRight:4 }} onClick={() => updateStatus(c._id, 'approved')}>Approve</button>
                            )}
                            {c.status !== 'rejected' && (
                              <button className="btn btn-sm btn-danger" onClick={() => updateStatus(c._id, 'rejected', 'Admin decision')}>Reject</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="fade-up">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>User Management</h2>
            {loading
              ? <div className="spinner spinner-lg" style={{ margin:'40px auto', display:'block' }} />
              : <div className="card">
                  <table className="table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td style={{ fontWeight:600 }}>👤 {u.name}</td>
                          <td style={{ color:'var(--muted)', fontSize:12 }}>{u.email}</td>
                          <td><span className="badge badge-purple" style={{ textTransform:'capitalize' }}>{u.role}</span></td>
                          <td style={{ color:'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                          <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                          <td>
                            {u._id !== user.id && (
                              <button
                                className={`btn btn-sm ${u.isActive ? 'btn-danger' : ''}`}
                                style={!u.isActive ? { background:'rgba(34,211,165,.15)', color:'var(--accent)' } : {}}
                                onClick={() => toggleUser(u._id)}
                              >
                                {u.isActive ? 'Suspend' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        )}

        {/* DONATIONS */}
        {tab === 'donations' && (
          <div className="fade-up">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>All Donations</h2>
            {loading
              ? <div className="spinner spinner-lg" style={{ margin:'40px auto', display:'block' }} />
              : <div className="card">
                  <table className="table">
                    <thead><tr><th>Donor</th><th>Campaign</th><th>Amount</th><th>Method</th><th>Txn ID</th><th>Date</th></tr></thead>
                    <tbody>
                      {donations.map(d => (
                        <tr key={d._id}>
                          <td style={{ fontWeight:600 }}>{d.donor?.name}</td>
                          <td style={{ color:'var(--muted)', fontSize:12 }}>{d.campaign?.title?.slice(0, 30)}...</td>
                          <td style={{ color:'var(--accent)', fontWeight:700 }}>\u20b9{d.amount?.toLocaleString('en-IN')}</td>
                          <td><span className="badge badge-purple">{d.paymentMethod}</span></td>
                          <td style={{ fontFamily:'monospace', fontSize:11, color:'var(--accent2)' }}>{d.transactionId}</td>
                          <td style={{ color:'var(--muted)' }}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        )}

        {/* STATS */}
        {tab === 'stats' && (
          <div className="fade-up">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>Platform Stats</h2>
            {loading
              ? <div className="spinner spinner-lg" style={{ margin:'40px auto', display:'block' }} />
              : stats && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
                  {[
                    ['Total Users',       stats.totalUsers,       'green'],
                    ['Live Campaigns',    stats.totalCampaigns,   'purple'],
                    ['Total Raised',      fmt(stats.totalRaised), 'yellow'],
                    ['Total Donations',   stats.totalDonations,   'green'],
                    ['Pending Review',    stats.pendingCampaigns, 'yellow'],
                  ].map(([label, value, color]) => (
                    <div key={label} className="card" style={{ padding:22 }}>
                      <div style={{ fontSize:12, color:'var(--muted)', marginBottom:8 }}>{label}</div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color:`var(--${color})` }}>{value}</div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

      </div>
    </div>
  );
}