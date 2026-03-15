import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api';

const CATEGORIES = ['Medical','Education','Disaster','Community','Disability','Other'];

export default function Submit() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    title:'', story:'', category:'', targetAmount:'',
    beneficiaryName:'', hospitalName:'', doctorRegNo:'',
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    setScoring(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      files.forEach(f => fd.append('documents', f));
      const { data } = await API.post('/campaigns', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      setStep(3);
    } catch (err) {
      toast(err.response?.data?.message || 'Submission failed.', 'error');
    }
    setLoading(false);
    setScoring(false);
  };

  const ScoreRing = ({ score }) => {
    const color = score>=70?'var(--accent)':score>=50?'var(--yellow)':'var(--red)';
    const r = 32; const circ = 2*Math.PI*r;
    return (
      <div style={{ position:'relative', width:80, height:80, flexShrink:0 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--bg3)" strokeWidth="8" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${(score/100)*circ} ${circ}`} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color }}>{score}%</div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 32px' }} className="fade-up">
      <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, marginBottom:6 }}>Start a Campaign 🚀</h2>
      <p style={{ color:'var(--muted)', fontSize:15, marginBottom:28 }}>AI verifies your campaign before it goes live — maximising donor trust.</p>

      {/* Stepper */}
      <div style={{ display:'flex', marginBottom:32 }}>
        {['Campaign Details','Documents & Verify','Result'].map((s,i) => (
          <div key={i} style={{ flex:1, textAlign:'center' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', margin:'0 auto 8px', display:'flex', alignItems:'center', justifyContent:'center', background: step>i+1?'var(--accent)':step===i+1?'rgba(34,211,165,.2)':'var(--bg3)', border:`1px solid ${step>=i+1?'var(--accent)':'var(--border)'}`, color: step>i+1?'#0b0f1a':'var(--text)', fontWeight:700, fontSize:13 }}>
              {step>i+1?'✓':i+1}
            </div>
            <div style={{ fontSize:12, color: step===i+1?'var(--text)':'var(--muted)' }}>{s}</div>
          </div>
        ))}
      </div>

      {step===1 && (
        <div>
          <div className="card" style={{ padding:26, marginBottom:16 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:18 }}>📝 Campaign Information</div>
            <div className="form-group">
              <label className="form-label">Campaign Title *</label>
              <input className="form-input" placeholder="e.g. Heart surgery for my daughter" value={form.title} onChange={set('title')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount (₹) *</label>
                <input className="form-input" type="number" placeholder="e.g. 350000" value={form.targetAmount} onChange={set('targetAmount')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Story * <span style={{color:'var(--muted)',fontWeight:400}}>(min. 100 chars)</span></label>
              <textarea className="form-textarea" style={{ minHeight:120 }} placeholder="Explain the situation in detail — what happened, who needs help, and how the funds will be used..." value={form.story} onChange={set('story')} />
              <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{form.story.length} characters</div>
            </div>
          </div>

          <div className="card" style={{ padding:26, marginBottom:20 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:18 }}>🏥 Medical Details <span style={{fontWeight:400,color:'var(--muted)',fontSize:13}}>(used for AI verification)</span></div>
            <div className="form-group">
              <label className="form-label">Beneficiary Full Name</label>
              <input className="form-input" placeholder="Patient / beneficiary name" value={form.beneficiaryName} onChange={set('beneficiaryName')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hospital & City</label>
                <input className="form-input" placeholder="e.g. AIIMS, New Delhi" value={form.hospitalName} onChange={set('hospitalName')} />
              </div>
              <div className="form-group">
                <label className="form-label">Doctor NMC Reg. No.</label>
                <input className="form-input" placeholder="e.g. MH-12345" value={form.doctorRegNo} onChange={set('doctorRegNo')} />
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(2)} disabled={!form.title||!form.category||!form.targetAmount||form.story.length<50}>
            Continue to Documents →
          </button>
        </div>
      )}

      {step===2 && (
        <div>
          <div className="card" style={{ padding:26, marginBottom:16 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:12 }}>📄 Upload Supporting Documents</div>
            <div className="alert alert-info"><span>🤖</span>Our AI will analyze documents using ELA, metadata inspection, OCR logic checks, and doctor NMC cross-referencing.</div>
            <div style={{ border:'2px dashed var(--border2)', borderRadius:10, padding:28, textAlign:'center', cursor:'pointer', background:'var(--bg3)', transition:'border-color .2s' }}
              onClick={() => document.getElementById('doc-upload').click()}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border2)'}
            >
              <div style={{ fontSize:36, marginBottom:8 }}>📎</div>
              <div style={{ fontSize:14, color:'var(--muted)' }}>Click to upload PDFs or images (max 5MB each)</div>
              <input id="doc-upload" type="file" multiple accept=".pdf,image/*" style={{ display:'none' }} onChange={e => setFiles(Array.from(e.target.files))} />
            </div>
            {files.length > 0 && (
              <div style={{ marginTop:12 }}>
                {files.map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'var(--bg3)', borderRadius:8, marginBottom:6, fontSize:13 }}>
                    <span>📄</span><span style={{ flex:1 }}>{f.name}</span><span style={{ color:'var(--muted)' }}>{(f.size/1024).toFixed(0)}KB</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {scoring && (
            <div className="alert alert-info"><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⚡</span>
              Running 6-layer AI verification: NLP → Document ELA → Reverse Image Search → Doctor NMC → Cost Validation → Hospital Geo-Check...
            </div>
          )}

          <div style={{ display:'flex', gap:12 }}>
            <button className="btn btn-ghost btn-lg" style={{ flex:1 }} onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary btn-lg" style={{ flex:2 }} onClick={handleSubmit} disabled={loading}>
              {loading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> AI Verifying...</> : '🤖 Run AI Verification & Submit →'}
            </button>
          </div>
        </div>
      )}

      {step===3 && result && (
        <div className="fade-up">
          <div className="card" style={{ padding:26, marginBottom:16 }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:16 }}>🤖 AI Verification Result</div>
            <div style={{ display:'flex', alignItems:'center', gap:24, background:'var(--bg3)', borderRadius:10, padding:18, marginBottom:14 }}>
              <ScoreRing score={result.aiScore} />
              <div style={{ flex:1 }}>
                {[['Text Credibility (NLP)', result.campaign?.aiChecks?.nlpCredibility],['Document ELA Analysis', result.campaign?.aiChecks?.documentEla],['Image Originality', result.campaign?.aiChecks?.imageOriginality],['Doctor NMC Verification', result.campaign?.aiChecks?.doctorVerification],['Treatment Cost Validation', result.campaign?.aiChecks?.costValidation],['Hospital Geo-Check', result.campaign?.aiChecks?.hospitalGeoCheck]].map(([l,p]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, marginBottom:5, color:'var(--muted)' }}>
                    <span>{p?'✅':'⚠️'}</span>{l}
                  </div>
                ))}
              </div>
            </div>
            {result.aiStatus==='approved' && <div className="alert alert-success"><span>✅</span>Campaign auto-approved! It's now live and will broadcast to thousands of donors.</div>}
            {result.aiStatus==='manual_review' && <div className="alert alert-warn"><span>⚠️</span>Sent for manual admin review (typically within 24 hours).</div>}
            {result.aiStatus==='rejected' && <div className="alert alert-error"><span>❌</span>Score too low. Please ensure all documents are genuine and retry.</div>}
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
        </div>
      )}
    </div>
  );
}