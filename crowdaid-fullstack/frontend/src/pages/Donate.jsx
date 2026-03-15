import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

export default function Donate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [amount, setAmount]     = useState('');
  const [preset, setPreset]     = useState(null);
  const PRESETS = [500, 1000, 2000, 5000];

  useEffect(() => {
    API.get(`/campaigns/${id}`)
      .then(r => setCampaign(r.data.campaign))
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;
  if (!campaign) return null;

  const pct = Math.min(Math.round((campaign.raisedAmount/campaign.targetAmount)*100),100);

  const handleProceed = () => {
    if (!user) { navigate('/login'); return; }
    if (!amount || isNaN(amount) || Number(amount)<1) return;
    navigate(`/payment/${id}`, { state: { amount: Number(amount) } });
  };

  return (
    <div style={{ minHeight:'calc(100vh - 70px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', background:'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,211,165,.06), transparent)' }}>
      <div style={{ width:'100%', maxWidth:560 }}>
        <div className="card fade-up" style={{ overflow:'hidden' }}>
          <div style={{ height:160, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:64, position:'relative' }}>
            {campaign.emoji || '🌟'}
            <span style={{ position:'absolute', top:12, right:12, background:'rgba(34,211,165,.15)', border:'1px solid rgba(34,211,165,.4)', color:'var(--accent)', fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>
              ⚡ {campaign.aiScore}% verified
            </span>
          </div>
          <div style={{ padding:28 }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--accent2)', fontWeight:700, marginBottom:8 }}>{campaign.category}</div>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, marginBottom:10, lineHeight:1.35 }}>{campaign.title}</h2>
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7, marginBottom:18 }}>{campaign.story}</p>

            <div style={{ marginBottom:20 }}>
              <div className="progress"><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginTop:6, color:'var(--muted)' }}>
                <span><strong style={{color:'var(--text)'}}>{fmt(campaign.raisedAmount)}</strong> raised ({pct}%)</span>
                <span>Goal: {fmt(campaign.targetAmount)}</span>
              </div>
            </div>

            <div style={{ background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.2)', borderRadius:10, padding:14, marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#a5b4fc', marginBottom:10 }}>🔒 Your money is fully protected</div>
              {[['30%','Campaign verified & live'],['40%','Hospital admission proof uploaded'],['30%','Discharge summary — or auto-refunded in 30 days']].map(([p,l]) => (
                <div key={p} style={{ display:'flex', gap:10, marginBottom:7 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent2)', marginTop:5, flexShrink:0 }} />
                  <div style={{ fontSize:12, color:'var(--muted)' }}><strong style={{color:'var(--text)'}}>{p}</strong> released when {l}</div>
                </div>
              ))}
            </div>

            <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Select Amount</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
              {PRESETS.map(p => (
                <button key={p} onClick={() => { setPreset(p); setAmount(String(p)); }}
                  style={{ padding:'7px 16px', border:`1px solid ${preset===p?'var(--accent)':'var(--border2)'}`, borderRadius:8, fontSize:13, cursor:'pointer', background: preset===p?'rgba(34,211,165,.1)':'transparent', color: preset===p?'var(--accent)':'var(--muted)', transition:'all .2s' }}>
                  ₹{p.toLocaleString()}
                </button>
              ))}
            </div>
            <input className="form-input" type="number" placeholder="Or enter custom amount (₹)" value={amount} min={1} onChange={e => { setAmount(e.target.value); setPreset(null); }} style={{ marginBottom:16 }} />

            <button className="btn btn-primary btn-full btn-lg" onClick={handleProceed} disabled={!amount||isNaN(amount)||Number(amount)<1}>
              Proceed to Payment → {amount && Number(amount)>0 ? `₹${Number(amount).toLocaleString()}` : ''}
            </button>
            <div style={{ textAlign:'center', fontSize:12, color:'var(--muted)', marginTop:10 }}>🔐 Secured · UPI / Card / NetBanking / Wallet</div>
          </div>
        </div>
      </div>
    </div>
  );
}