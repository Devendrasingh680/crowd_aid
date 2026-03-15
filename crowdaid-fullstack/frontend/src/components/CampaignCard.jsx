import { useNavigate } from 'react-router-dom';

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

export default function CampaignCard({ campaign, onDonate }) {
  const pct = Math.min(Math.round((campaign.raisedAmount / campaign.targetAmount) * 100), 100);

  return (
    <div style={{
      background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)',
      overflow:'hidden', transition:'border-color .2s, transform .2s', cursor:'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; }}
    >
      {/* Image area */}
      <div style={{ height:150, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, position:'relative' }}>
        {campaign.emoji || '🌟'}
        <span style={{
          position:'absolute', top:10, right:10, background:'rgba(34,211,165,.15)',
          border:'1px solid rgba(34,211,165,.4)', color:'var(--accent)', fontSize:11,
          fontWeight:600, padding:'3px 10px', borderRadius:20,
        }}>
          ⚡ {campaign.aiScore}% verified
        </span>
      </div>

      <div style={{ padding:18 }}>
        <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--accent2)', fontWeight:700, marginBottom:7 }}>
          {campaign.category}
        </div>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:8, lineHeight:1.4 }}>
          {campaign.title}
        </div>
        <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.55, marginBottom:14 }}>
          {campaign.story?.slice(0, 90)}...
        </div>

        <div style={{ marginBottom:14 }}>
          <div className="progress"><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginTop:5, color:'var(--muted)' }}>
            <span>{pct}% funded</span>
            <span>{campaign.daysLeft || 30}d left</span>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:13, color:'var(--muted)' }}>
            Raised <strong style={{ color:'var(--text)' }}>{fmt(campaign.raisedAmount)}</strong> of {fmt(campaign.targetAmount)}
          </div>
          <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onDonate(campaign); }}>
            Donate
          </button>
        </div>
      </div>
    </div>
  );
}