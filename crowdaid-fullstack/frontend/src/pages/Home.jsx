import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import CampaignCard from '../components/CampaignCard';

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

export default function Home() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [donate, setDonate]     = useState(null);

  useEffect(() => {
    API.get('/campaigns?limit=6').then(r => setCampaigns(r.data.campaigns)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* HERO */}
      <div style={{
        padding:'80px 32px 60px', textAlign:'center', maxWidth:860, margin:'0 auto',
        background:'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,211,165,.12), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(99,102,241,.08), transparent)',
      }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(34,211,165,.12)', border:'1px solid rgba(34,211,165,.3)', padding:'6px 14px', borderRadius:20, fontSize:13, color:'var(--accent)', marginBottom:24 }}>
          🛡️ AI-Verified Campaigns Only
        </div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(36px,6vw,66px)', fontWeight:800, lineHeight:1.1, marginBottom:18 }}>
          Fundraising Built on <span style={{ color:'var(--accent)' }}>Trust</span> &amp; Accountability
        </h1>
        <p style={{ fontSize:18, color:'var(--muted)', maxWidth:560, margin:'0 auto 32px', lineHeight:1.65 }}>
          Every campaign verified by AI before you donate. Every rupee tracked through staged release. India's most accountable crowdfunding platform.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/browse')}>Browse Campaigns</button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/register')}>Start Fundraising</button>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:'var(--radius)', margin:'36px auto 0', maxWidth:680, overflow:'hidden' }}>
          {[['₹1.2Cr+','Funds Raised'],['500+','Campaigns Verified'],['95%','Fraud Detected'],['10K+','Donors']].map(([n,l],i) => (
            <div key={i} style={{ flex:1, padding:'22px 16px', textAlign:'center', borderRight: i<3 ? '1px solid var(--border)' : '', background:'var(--card)' }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--accent)' }}>{n}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pillars */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18, maxWidth:960, margin:'0 auto 56px', padding:'0 32px' }}>
        {[
          { icon:'🤖', t:'AI Verification', d:'6-layer fraud detection: NLP, document ELA, doctor NMC check, cost validation before any campaign goes live.' },
          { icon:'📡', t:'Auto Spreading', d:'Every verified campaign broadcasts to thousands of matching donors via email, Telegram and push notifications.' },
          { icon:'🔒', t:'Staged Release', d:'Funds in 3 stages tied to proof. No proof in 30 days? Donors get auto-refunded. Full accountability.' },
        ].map(p => (
          <div key={p.t} className="card" style={{ padding:26, textAlign:'center', transition:'border-color .2s, transform .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; }}
          >
            <div style={{ fontSize:36, marginBottom:12 }}>{p.icon}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:7 }}>{p.t}</div>
            <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>{p.d}</div>
          </div>
        ))}
      </div>

      {/* Featured Campaigns */}
      <div className="section">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <div className="section-title">Featured Campaigns</div>
            <div className="section-sub">All AI-verified — your donation is protected</div>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/browse')}>View All →</button>
        </div>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
            {[1,2,3].map(i => <div key={i} className="card" style={{ height:340 }} />)}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
            {campaigns.map(c => <CampaignCard key={c._id} campaign={c} onDonate={() => navigate(`/donate/${c._id}`)} />)}
          </div>
        )}
        {!loading && campaigns.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🌟</div>
            <div>No campaigns yet. Be the first to start one!</div>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/register')}>Start a Campaign</button>
          </div>
        )}
      </div>
    </div>
  );
}