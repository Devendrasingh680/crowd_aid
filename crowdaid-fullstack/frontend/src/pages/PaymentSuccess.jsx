import { useLocation, useNavigate } from 'react-router-dom';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function PaymentSuccess() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const d = state?.donation;

  if (!d) { navigate('/'); return null; }

  const methodLabel = {
    upi: `UPI (${d.paymentDetails?.upiId || ''})`,
    card: `Card ending ${d.paymentDetails?.cardLast4 || '****'}`,
    netbanking: `Net Banking (${d.paymentDetails?.bank || ''})`,
    wallet: `Wallet (${d.paymentDetails?.wallet || ''})`,
  }[d.paymentMethod] || d.paymentMethod;

  return (
    <div style={{ minHeight:'calc(100vh - 70px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px' }}>
      <div style={{ width:'100%', maxWidth:480, textAlign:'center' }}>
        <div className="card fade-up" style={{ padding:'44px 38px', position:'relative', overflow:'hidden', border:'1px solid rgba(34,211,165,.25)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'linear-gradient(90deg,var(--accent),var(--accent2),var(--accent))' }} />
          <div style={{ position:'absolute', top:-50, left:'50%', transform:'translateX(-50%)', width:200, height:200, background:'radial-gradient(circle, rgba(34,211,165,.12), transparent 70%)', pointerEvents:'none' }} />

          <div style={{ fontSize:22, marginBottom:16 }}>🎉 💝 🌟 💚 🎊</div>

          <div style={{ width:88, height:88, borderRadius:'50%', background:'rgba(34,211,165,.1)', border:'2px solid rgba(34,211,165,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, margin:'0 auto 20px', position:'relative' }}>
            ✅
          </div>

          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, marginBottom:8 }}>Payment Successful!</h2>
          <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.65, marginBottom:24 }}>
            Your donation is received and protected in escrow. You'll get an email confirmation shortly.
          </p>

          <div style={{ fontFamily:'Syne,sans-serif', fontSize:46, fontWeight:800, color:'var(--accent)', marginBottom:4 }}>
            {fmt(d.amount)}
          </div>
          <div style={{ fontSize:13, color:'var(--muted)', marginBottom:28 }}>
            donated to <strong style={{color:'var(--text)'}}>{d.campaignEmoji} {d.campaignTitle}</strong>
          </div>

          <div className="card" style={{ padding:'16px 20px', marginBottom:24, textAlign:'left' }}>
            {[
              ['Transaction ID', <span style={{ fontFamily:'monospace', fontSize:12, color:'var(--accent2)' }}>{d.transactionId}</span>],
              ['Payment Method', methodLabel],
              ['Donation', fmt(d.amount)],
              ['Platform Fee', fmt(d.platformFee)],
              ['Total Charged', <strong style={{color:'var(--accent)'}}>{fmt(d.totalCharged)}</strong>],
              ['Donor', d.donorName],
              ['Status', <span style={{color:'var(--accent)'}}>✅ Confirmed</span>],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                <span style={{ color:'var(--muted)' }}>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>

          <div className="alert alert-info" style={{ textAlign:'left', marginBottom:24, fontSize:12 }}>
            <span>🔒</span>
            <div><strong>Fund Release Schedule:</strong><br/>
            30% → Campaign Verified &nbsp;•&nbsp; 40% → Admission Proof &nbsp;•&nbsp; 30% → Discharge Summary.<br/>
            If proof isn't uploaded in 30 days, you'll be auto-refunded.</div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/browse')}>🔍 Donate to Another Campaign</button>
            <button className="btn btn-ghost btn-full" onClick={() => navigate('/dashboard')}>📊 View My Dashboard</button>
            <button className="btn btn-ghost btn-full" onClick={() => navigate('/')}>🏠 Back to Home</button>
          </div>

          <div style={{ marginTop:20, fontSize:11, color:'var(--muted2)' }}>
            🧪 This was a demo payment. No real money was charged.
          </div>
        </div>
      </div>
    </div>
  );
}