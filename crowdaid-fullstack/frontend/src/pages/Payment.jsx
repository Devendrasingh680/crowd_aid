import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const PROCESSING_STEPS = [
  'Connecting to payment gateway...',
  'Authenticating your transaction...',
  'Verifying with bank server...',
  'Securing funds in escrow...',
  'Payment confirmed! ✓',
];

export default function Payment() {
  const { campaignId } = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const toast     = useToast();

  const [campaign,  setCampaign]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [amount,    setAmount]    = useState(location.state?.amount || '');
  const [method,    setMethod]    = useState('upi');
  const [upiId,     setUpiId]     = useState('');
  const [upiOk,     setUpiOk]     = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [cardNum,   setCardNum]   = useState('');
  const [cardName,  setCardName]  = useState('');
  const [cardExp,   setCardExp]   = useState('');
  const [cardCvv,   setCardCvv]   = useState('');
  const [bank,      setBank]      = useState('');
  const [wallet,    setWallet]    = useState('');
  const [processing,setProcessing] = useState(false);
  const [procStep,  setProcStep]  = useState(0);
  const [message,   setMessage]   = useState('');
  const [anon,      setAnon]      = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    API.get(`/campaigns/${campaignId}`)
      .then(r => setCampaign(r.data.campaign))
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const platformFee = Math.round((Number(amount) || 0) * 0.005);
  const total = (Number(amount) || 0) + platformFee;

  const formatCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExp  = v => { const c = v.replace(/\D/g,'').slice(0,4); return c.length>=3?c.slice(0,2)+'/'+c.slice(2):c; };

  const verifyUpi = () => {
    if (!upiId.includes('@')) { setError('Enter a valid UPI ID (e.g. name@upi)'); return; }
    setVerifyingUpi(true); setError('');
    setTimeout(() => { setVerifyingUpi(false); setUpiOk(true); }, 1200);
  };

  const canPay = () => {
    if (!amount || isNaN(amount) || Number(amount) < 1) return false;
    if (method === 'upi') return upiOk;
    if (method === 'card') return cardNum.replace(/\s/g,'').length===16 && cardName && cardExp.includes('/') && cardCvv.length===3;
    if (method === 'netbanking') return !!bank;
    if (method === 'wallet') return !!wallet;
    return false;
  };

  const handlePay = async () => {
    setError(''); setProcessing(true); setProcStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProcStep(step);
      if (step >= PROCESSING_STEPS.length - 1) clearInterval(interval);
    }, 700);

    // Wait for animation then call API
    setTimeout(async () => {
      try {
        const paymentDetails = {};
        if (method==='upi') paymentDetails.upiId = upiId;
        if (method==='card') paymentDetails.cardLast4 = cardNum.replace(/\s/g,'').slice(-4);
        if (method==='netbanking') paymentDetails.bank = bank;
        if (method==='wallet') paymentDetails.wallet = wallet;

        const { data } = await API.post('/donations', {
          campaignId,
          amount: Number(amount),
          paymentMethod: method,
          paymentDetails,
          message,
          isAnonymous: anon,
        });

        navigate('/payment-success', { state: { donation: data.donation } });
      } catch (err) {
        setProcessing(false);
        setError(err.response?.data?.message || 'Payment failed. Please try again.');
        toast('Payment failed', 'error');
      }
    }, PROCESSING_STEPS.length * 700 + 400);
  };

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;
  if (!campaign) return null;

  const BANKS   = ['SBI','HDFC','ICICI','Axis Bank','Kotak','PNB','Bank of Baroda','Yes Bank'];
  const WALLETS = ['Paytm','PhonePe','Amazon Pay','MobiKwik','Freecharge'];
  const PRESETS = [500, 1000, 2000, 5000];

  return (
    <div style={{ minHeight:'calc(100vh - 70px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', background:'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,211,165,.07), transparent)' }}>
      <div style={{ width:'100%', maxWidth:520 }}>
        <div className="card" style={{ overflow:'hidden' }}>

          {/* Header */}
          <div style={{ padding:'26px 30px', borderBottom:'1px solid var(--border)', background:'linear-gradient(135deg, rgba(34,211,165,.06), rgba(99,102,241,.06))' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18 }}>Crowd<span style={{color:'var(--accent)'}}>Aid</span> Pay</span>
              <span style={{ fontSize:11, background:'rgba(245,158,11,.15)', color:'var(--yellow)', border:'1px solid rgba(245,158,11,.3)', padding:'2px 8px', borderRadius:6, fontWeight:700 }}>DEMO MODE</span>
            </div>
            <div style={{ fontSize:13, color:'var(--muted)', marginBottom:8 }}>Donating to</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:12 }}>{campaign.emoji} {campaign.title}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span style={{ fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, color:'var(--accent)' }}>
                {amount ? fmt(amount) : '₹—'}
              </span>
            </div>
            {amount && <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>+ {fmt(platformFee)} fee = <strong style={{color:'var(--text)'}}>{fmt(total)}</strong> total</div>}
          </div>

          {/* Body */}
          <div style={{ padding:'26px 30px' }}>
            {processing ? (
              <div style={{ textAlign:'center', padding:'12px 0 8px' }}>
                <div style={{ fontSize:54, marginBottom:16 }}>{procStep < PROCESSING_STEPS.length - 1 ? '⏳' : '✅'}</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, marginBottom:20 }}>Processing Payment...</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                  {PROCESSING_STEPS.map((s,i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10,
                      background: i<procStep?'rgba(34,211,165,.07)': i===procStep?'rgba(99,102,241,.07)':'var(--bg3)',
                      border:`1px solid ${i<procStep?'rgba(34,211,165,.25)':i===procStep?'rgba(99,102,241,.25)':'var(--border)'}`,
                    }}>
                      <span>{i<procStep?'✅':i===procStep?'⏳':'⭕'}</span>
                      <span style={{ fontSize:13, color: i<procStep?'var(--accent)':i===procStep?'#a5b4fc':'var(--muted)' }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>Please do not close this window</div>
              </div>
            ) : (
              <>
                {/* Amount */}
                <div className="form-group">
                  <label className="form-label">Donation Amount (₹)</label>
                  <input className="form-input" type="number" placeholder="Enter amount" value={amount} min={1} onChange={e => setAmount(e.target.value)} />
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                    {PRESETS.map(p => (
                      <button key={p} type="button" onClick={() => setAmount(String(p))}
                        style={{ padding:'5px 14px', border:`1px solid ${amount==p?'var(--accent)':'var(--border2)'}`, borderRadius:8, fontSize:13, cursor:'pointer', background: amount==p?'rgba(34,211,165,.1)':'transparent', color: amount==p?'var(--accent)':'var(--muted)', transition:'all .2s' }}>
                        ₹{p.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ fontSize:13, color:'var(--muted)', fontWeight:600, marginBottom:12 }}>PAYMENT METHOD</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:20 }}>
                  {[['upi','📱','UPI'],['card','💳','Card'],['netbanking','🏦','NetBanking'],['wallet','👛','Wallet']].map(([id,icon,label]) => (
                    <div key={id} onClick={() => { setMethod(id); setError(''); }}
                      style={{ padding:'11px 6px', border:`1px solid ${method===id?'var(--accent)':'var(--border2)'}`, borderRadius:10, cursor:'pointer', textAlign:'center', background: method===id?'rgba(34,211,165,.08)':'transparent', transition:'all .2s' }}>
                      <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
                      <div style={{ fontSize:11, color: method===id?'var(--accent)':'var(--muted)', fontWeight: method===id?700:400 }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-warn"><span>🧪</span><div><strong>Demo Mode</strong> — No real payment is made. Enter any valid-looking details and click Pay.</div></div>

                {/* UPI */}
                {method==='upi' && (
                  <div className="form-group">
                    <label className="form-label">UPI ID</label>
                    <div style={{ display:'flex', gap:8 }}>
                      <input className="form-input" placeholder="yourname@upi" value={upiId}
                        onChange={e => { setUpiId(e.target.value); setUpiOk(false); }}
                        style={{ borderColor: upiOk?'var(--accent)':'' }}
                      />
                      <button type="button" className="btn btn-ghost" onClick={verifyUpi} disabled={verifyingUpi||!upiId} style={{ whiteSpace:'nowrap' }}>
                        {verifyingUpi ? <span className="spinner" style={{width:14,height:14}} /> : upiOk ? '✅ OK' : 'Verify'}
                      </button>
                    </div>
                    {upiOk && <div style={{ fontSize:12, color:'var(--accent)', marginTop:5 }}>✅ UPI ID verified — ready to pay</div>}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
                      {['user@okaxis','name@ybl','phone@paytm','test@icici'].map(id => (
                        <button key={id} type="button" onClick={() => { setUpiId(id); setUpiOk(false); }}
                          style={{ fontSize:11, padding:'3px 10px', border:'1px solid var(--border2)', borderRadius:6, background:'transparent', color:'var(--muted)', cursor:'pointer' }}>
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CARD */}
                {method==='card' && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <div style={{ position:'relative' }}>
                        <input className="form-input" placeholder="1234 5678 9012 3456" value={cardNum}
                          onChange={e => setCardNum(formatCard(e.target.value))} maxLength={19} />
                        <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:20 }}>
                          {cardNum.startsWith('4')?'💙':cardNum.startsWith('5')?'🟠':cardNum.startsWith('6')?'🔴':'💳'}
                        </span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cardholder Name</label>
                      <input className="form-input" placeholder="RAHUL SHARMA" value={cardName}
                        onChange={e => setCardName(e.target.value.toUpperCase())} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Expiry (MM/YY)</label>
                        <input className="form-input" placeholder="12/27" value={cardExp}
                          onChange={e => setCardExp(formatExp(e.target.value))} maxLength={5} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input className="form-input" placeholder="•••" type="password" value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))} maxLength={3} />
                      </div>
                    </div>
                  </div>
                )}

                {/* NET BANKING */}
                {method==='netbanking' && (
                  <div className="form-group">
                    <label className="form-label">Select Bank</label>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {BANKS.map(b => (
                        <div key={b} onClick={() => setBank(b)}
                          style={{ padding:'11px 12px', border:`1px solid ${bank===b?'var(--accent)':'var(--border2)'}`, borderRadius:10, cursor:'pointer', fontSize:13, color: bank===b?'var(--text)':'var(--muted)', background: bank===b?'rgba(34,211,165,.08)':'transparent', transition:'all .2s' }}>
                          🏦 {b}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WALLET */}
                {method==='wallet' && (
                  <div className="form-group">
                    <label className="form-label">Select Wallet</label>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {WALLETS.map(w => (
                        <div key={w} onClick={() => setWallet(w)}
                          style={{ padding:'11px 12px', border:`1px solid ${wallet===w?'var(--accent)':'var(--border2)'}`, borderRadius:10, cursor:'pointer', fontSize:13, color: wallet===w?'var(--text)':'var(--muted)', background: wallet===w?'rgba(34,211,165,.08)':'transparent', transition:'all .2s' }}>
                          👛 {w}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message + anon */}
                <div className="form-group">
                  <label className="form-label">Message (optional)</label>
                  <input className="form-input" placeholder="Leave a message of support..." value={message} onChange={e => setMessage(e.target.value)} />
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--muted)', cursor:'pointer', marginBottom:16 }}>
                  <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} /> Donate anonymously
                </label>

                {/* Summary */}
                <div className="card" style={{ padding:'14px 18px', marginBottom:18 }}>
                  {[['Donation Amount', fmt(amount||0)], ['Platform Fee (0.5%)', fmt(platformFee)]].map(([l,v]) => (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      <span style={{ color:'var(--muted)' }}>{l}</span><span>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:700, paddingTop:10 }}>
                    <span>Total Payable</span><span style={{ color:'var(--accent)' }}>{fmt(total)}</span>
                  </div>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom:12 }}><span>⚠️</span>{error}</div>}

                <button className="btn btn-primary btn-full btn-lg" onClick={handlePay} disabled={!canPay()}>
                  🔒 Pay {fmt(total)} {method==='upi'?'via UPI':method==='card'?'via Card':method==='netbanking'?'via NetBanking':'via Wallet'}
                </button>
                <div style={{ textAlign:'center', fontSize:12, color:'var(--muted)', marginTop:10 }}>
                  🔐 256-bit SSL · Demo mode — no real payment · PCI DSS Compliant
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}