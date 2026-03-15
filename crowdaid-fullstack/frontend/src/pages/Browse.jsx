import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import CampaignCard from '../components/CampaignCard';

const CATS = ['All','Medical','Education','Disaster','Community','Disability','Other'];

export default function Browse() {
  const navigate   = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cat, setCat]             = useState('All');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:9 });
      if (cat !== 'All') params.set('category', cat);
      if (search.trim()) params.set('search', search.trim());
      const { data } = await API.get(`/campaigns?${params}`);
      setCampaigns(data.campaigns);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { setPage(1); }, [cat, search]);
  useEffect(() => { fetchCampaigns(); }, [cat, page]);

  const handleSearch = (e) => { e.preventDefault(); fetchCampaigns(); };

  return (
    <div className="section fade-up">
      <div className="section-title">Browse Campaigns</div>
      <div className="section-sub">{total} verified campaigns live right now</div>

      <form onSubmit={handleSearch} style={{ display:'flex', gap:10, marginBottom:20, maxWidth:440 }}>
        <input className="form-input" placeholder="🔍  Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className="btn"
            style={{
              padding:'6px 16px', borderRadius:20, fontSize:13, border:'1px solid var(--border2)',
              background: cat===c ? 'var(--accent)' : 'transparent',
              color: cat===c ? '#0b0f1a' : 'var(--muted)',
              fontWeight: cat===c ? 700 : 400,
            }}
          >{c}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="card" style={{ height:340 }} />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
          <div>No campaigns found{search ? ` for "${search}"` : ''}.</div>
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
            {campaigns.map(c => <CampaignCard key={c._id} campaign={c} onDonate={() => navigate(`/donate/${c._id}`)} />)}
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:32 }}>
            {page > 1 && <button className="btn btn-ghost" onClick={() => setPage(p => p-1)}>← Prev</button>}
            <span style={{ padding:'10px 16px', fontSize:14, color:'var(--muted)' }}>Page {page}</span>
            {campaigns.length === 9 && <button className="btn btn-ghost" onClick={() => setPage(p => p+1)}>Next →</button>}
          </div>
        </>
      )}
    </div>
  );
}