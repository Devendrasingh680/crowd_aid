import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api';

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`;

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const [tab, setTab]           = useState('overview');
  const [donations, setDonations] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [dLoading, setDLoading] = useState(false);
  const [cLoading, setCLoading] = useState(false);

  const isDonor   = user?.role === 'donor';
  const isCreator = user?.role === 'creator';

  useEffect(() => { refreshUser(); }, []);

  useEffect(() => {
    if (tab === 'donations' || tab === 'overview') {
      setDLoading(true);
      API.get('/donations/my').then(r => setDonations(r.data.donations)).catch(() => {}).finally(() => setDLoading(false));
    }
    if ((tab === 'campaigns' || tab === 'overview') && isCreator) {
      setCLoading(true);
      API.get('/campaigns/my/list').then(r => setMyCampaigns(r.data.campaigns)).catch(() => {}).finally(() => setCLoading(false));
    }
  }, [tab]);

  const CATS = ['Medical','Education','Disaster','Community','Disability'];
  const [alerts, setAlerts] = useState(user?.alertCategories || []);
  const toggleAlert = async (cat) => {
    const next = alerts.includes(cat) ? alerts.filter(c => c!==cat) : [...alerts, cat];
    setAlerts(next);
    try { await API.put('/auth/profile', { alertCategories: next }); toast(`Alert ${alerts.includes(cat)?'removed':'added'}!`); } catch {}
  };

  const links = isDonor
    ? [['overview','📊','Overview'],['donations','💝','Donations'],['alerts','🔔','Alerts']]
    : [['overview','📊','Overview'],['campaigns','🚀','My Campaigns'],['funds','💰','Fund Status'],['proofs','📋','Upload Proofs']];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'230px 1fr', minHeight:'calc(100vh - 70px)' }}>
      {/* Sidebar */}
      <div style={{ background:'var(--bg2)', borderRight:'1px solid var(--border)', padding:'24px 0' }}>
        <div style={{ padding:'0 16px 20px', borderBottom:'1px solid var(--border)', marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:'#0b0f1a', marginBottom:10 }}>
            {user?.name[0]}
          </div>
          <div style={{ fontWeight:600 }}>{user?.name}</div>
          <div style={{ fontSize:12, color:'var(--muted)', marginTop:2, textTransform:'capitalize' }}>{user?.role}</div>
        </div>
        <div style={{ padding:'0 16px' }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--muted)', padding:'0 8px', marginBottom:8 }}>Navigation</div>
          {links.map(([id,icon,label]) => (
            <div key={id} onClick={() => setTab(id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, cursor:'pointer', fontSize:14, color: tab===id?'var(--accent)':'var(--muted)', background: tab===id?'rgba(34,211,165,.08)':'transparent', border: tab===id?'1px solid rgba(34,211,165,.2)':'1px solid transparent', marginBottom:2, transition:'all .2s' }}>
              <span style={{ fontSize:18 }}>{icon}</span>{label}
            </div>
          ))}
          <Link to="/browse" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, cursor:'pointer', fontSize:14, color:'var(--muted)', marginBottom:2, transition:'all .2s', border:'1px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(34,211,165,.08)'; e.currentTarget.style.color='var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='var(--muted)'; }}
          >
            <span style={{ fontSize:18 }}>🌍</span>Browse All
          </Link>
          {isCreator && (
            <Link to="/submit" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, cursor:'pointer', fontSize:14, color:'var(--muted)', border:'1px solid transparent', transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(34,211,165,.08)'; e.currentTarget.style.color='var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='var(--muted)'; }}
            >
              <span style={{ fontSize:18 }}>➕</span>New Campaign
            </Link>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={{ padding:32, overflowY:'auto' }}>

        {/* OVERVIEW */}
        {tab==='overview' && (
          <div className="fade-up">
            <div style={{ marginBottom:28 }}>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800 }}>Hello, {user?.name?.split(' ')[0]} 👋</h2>
              <div style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14, marginBottom:28 }}>
              {isDonor ? [
                ['Total Donated', fmt(user?.totalDonated||0), 'green'],
                ['Campaigns Supported', user?.campaignsSupported||0, 'purple'],
                ['Recent Donations', donations.slice(0,3).length, 'yellow'],
              ] : [
                ['My Campaigns', myCampaigns.length, 'purple'],
                ['Total Raised', fmt(myCampaigns.reduce((a,c)=>a+c.raisedAmount,0)), 'green'],
                ['Total Donors', myCampaigns.reduce((a,c)=>a+c.donorCount,0), 'yellow'],
              ].map(([l,v,color]) => (
                <div key={l} className="card" style={{ padding:20 }}>
                  <div style={{ fontSize:12, color:'var(--muted)', marginBottom:8 }}>{l}</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:`var(--${color})` }}>{v}</div>
                </div>
              ))}
            </div>
            {isDonor && (
              <>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, marginBottom:16 }}>Recent Donations</h3>
                {dLoading ? <div className="spinner" /> : donations.slice(0,5).length ? (
                  <div className="card">
                    <table className="table">
                      <thead><tr><th>Campaign</th><th>Amount</th><th>Date</th><th>Method</th></tr></thead>
                      <tbody>
                        {donations.slice(0,5).map(d => (
                          <tr key={d._id}>
                            <td style={{fontWeight:600}}>{d.campaign?.emoji} {d.campaignTitle?.slice(0,35)}...</td>
                            <td style={{color:'var(--accent)',fontWeight:600}}>₹{d.amount.toLocaleString()}</td>
                            <td style={{color:'var(--muted)'}}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                            <td><span className="badge badge-purple">{d.paymentMethod.toUpperCase()}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <div style={{color:'var(--muted)',padding:'20px 0'}}>No donations yet. <Link to="/browse" style={{color:'var(--accent)'}}>Browse campaigns →</Link></div>}
              </>
            )}
          </div>
        )}

        {/* DONATIONS */}
        {tab==='donations' && (
          <div className="fade-up">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>My Donations</h2>
            {dLoading ? <div className="spinner spinner-lg" style={{margin:'40px auto',display:'block'}} /> : (
              donations.length === 0
                ? <div style={{textAlign:'center',padding:'60px 0',color:'var(--muted)'}}>No donations yet. <Link to="/browse" style={{color:'var(--accent)'}}>Start donating →</Link></div>
                : <div className="card"><table className="table"><thead><tr><th>Campaign</th><th>Amount</th><th>Method</th><th>Txn ID</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {donations.map(d => (
                      <tr key={d._id}>
                        <td style={{fontWeight:600,maxWidth:200}}>{d.campaignTitle?.slice(0,30)}...</td>
                        <td style={{color:'var(--accent)',fontWeight:700}}>₹{d.amount.toLocaleString()}</td>
                        <td><span className="badge badge-purple">{d.paymentMethod}</span></td>
                        <td style={{fontFamily:'monospace',fontSize:11,color:'var(--accent2)'}}>{d.transactionId}</td>
                        <td style={{color:'var(--muted)'}}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                        <td><span className={`badge ${d.status==='success'?'badge-green':'badge-red'}`}>{d.status}</span></td>
                      </tr>
                    ))}
                  </tbody></table></div>
            )}
          </div>
        )}

        {/* CAMPAIGNS */}
        {tab==='campaigns' && (
          <div className="fade-up">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800 }}>My Campaigns</h2>
              <Link to="/submit" className="btn btn-primary">+ New Campaign</Link>
            </div>
            {cLoading ? <div className="spinner spinner-lg" style={{margin:'40px auto',display:'block'}} /> :
              myCampaigns.length===0
                ? <div style={{textAlign:'center',padding:'60px 0',color:'var(--muted)'}}>No campaigns yet. <Link to="/submit" style={{color:'var(--accent)'}}>Create your first →</Link></div>
                : myCampaigns.map(c => {
                  const pct = Math.min(Math.round((c.raisedAmount/c.targetAmount)*100),100);
                  return (
                    <div key={c._id} className="card" style={{ padding:22, marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                        <div>
                          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:6 }}>{c.emoji} {c.title}</div>
                          <span className={`badge status-${c.status==='approved'?'approved':c.status==='rejected'?'rejected':c.status==='manual_review'?'review':'pending'}`}>{c.status.replace('_',' ')}</span>
                        </div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'var(--accent)' }}>{fmt(c.raisedAmount)}</div>
                      </div>
                      <div className="progress" style={{ marginBottom:6 }}><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--muted)' }}>
                        <span>{pct}% of {fmt(c.targetAmount)}</span>
                        <span>{c.donorCount} donors</span>
                      </div>
                      {c.status==='rejected' && c.rejectionReason && <div className="alert alert-error" style={{marginTop:10,fontSize:12}}><span>❌</span>{c.rejectionReason}</div>}
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ALERTS */}
        {tab==='alerts' && (
          <div className="fade-up">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:6 }}>Alert Preferences</h2>
            <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24 }}>Get notified when new verified campaigns match your interests.</p>
            {CATS.map(cat => (
              <div key={cat} className="card" style={{ padding:'16px 20px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:600, marginBottom:3 }}>{cat}</div>
                  <div style={{ fontSize:13, color:'var(--muted)' }}>Email + push alerts for {cat.toLowerCase()} campaigns</div>
                </div>
                <div onClick={() => toggleAlert(cat)}
                  style={{ width:44, height:24, borderRadius:12, background: alerts.includes(cat)?'var(--accent)':'var(--bg3)', border:'1px solid var(--border)', position:'relative', cursor:'pointer', transition:'background .25s' }}>
                  <div style={{ position:'absolute', top:2, left: alerts.includes(cat)?20:2, width:18, height:18, borderRadius:'50%', background: alerts.includes(cat)?'#0b0f1a':'var(--muted)', transition:'left .25s' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FUNDS / PROOFS — creator */}
        {(tab==='funds' || tab==='proofs') && (
          <div className="fade-up">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>{tab==='funds'?'Fund Release Tracker':'Upload Proofs'}</h2>
            {myCampaigns.filter(c=>c.status==='approved').length === 0
              ? <div style={{color:'var(--muted)'}}>No approved campaigns yet.</div>
              : myCampaigns.filter(c=>c.status==='approved').map(c => (
                <div key={c._id} className="card" style={{ padding:22, marginBottom:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:16 }}>{c.emoji} {c.title}</div>
                  <div style={{ display:'flex', gap:12 }}>
                    {[['30%','Released','Campaign verified','approved'],['40%',c.fundStages?.stage2Released?'Released':'Pending','Admission proof','approved'],['30%',c.fundStages?.stage3Released?'Released':'Pending','Discharge summary',c.fundStages?.stage3Released?'approved':'pending']].map(([pct,status,label,st]) => (
                      <div key={pct} style={{ flex:1, background:'var(--bg3)', border:`1px solid ${st==='approved'?'rgba(34,211,165,.35)':'var(--border)'}`, borderRadius:10, padding:14, textAlign:'center' }}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, color: st==='approved'?'var(--accent)':'var(--muted)' }}>{pct}</div>
                        <div style={{ fontSize:11, color: st==='approved'?'var(--accent)':'var(--yellow)', fontWeight:600, marginTop:4 }}>{st==='approved'?'✅':'⏳'} {status}</div>
                        <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {tab==='proofs' && (
                    <div style={{ marginTop:16 }}>
                      <div className="form-group">
                        <label className="form-label">Upload Proof Document (Stage 3)</label>
                        <div style={{ border:'2px dashed var(--border2)', borderRadius:10, padding:24, textAlign:'center', cursor:'pointer', background:'var(--bg3)' }}>
                          <div style={{ fontSize:32, marginBottom:6 }}>📎</div>
                          <div style={{ fontSize:13, color:'var(--muted)' }}>Click to upload PDF or image (max 5MB)</div>
                        </div>
                      </div>
                      <button className="btn btn-primary" onClick={() => toast('Proof submitted for admin review!')}>Submit Proof</button>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}

      </div>
    </div>
  );
}