// components/admin/AdminJobs.jsx
import { useCallback, useEffect, useState } from 'react';

// ── Adjust these two to match your app ───────────────────────────────
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin`;
const getToken = () => localStorage.getItem('adminToken');
// ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Live' },
  { key: 'rejected', label: 'Disapproved' },
];

const emptyForm = {
  title: '', clientName: '', category: '', speciality: '', openings: 1,
  budget: '', type: 'fixed', mode: '', state: '', lga: '', address: '',
  plan: 'basic', skills: '', description: '',
};

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

const naira = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

const initials = (u) => `${u?.firstName?.[0] || ''}${u?.lastName?.[0] || ''}`.toUpperCase() || '?';

const posterName = (job) =>
  job.client ? `${job.client.firstName} ${job.client.lastName}` : job.clientName || 'Unknown';

export default function AdminJobs() {
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);

  const notify = (message, type = 'ok') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: tab, page, limit: 15 });
      if (query) params.set('search', query);
      const data = await api(`/jobs?${params}`);
      setJobs(data.jobs);
      setCounts(data.counts);
      setPages(data.pagination.pages || 1);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, page, query]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const loadDetail = useCallback(async (id) => {
    if (!id) return setDetail(null);
    setDetailLoading(true);
    try {
      setDetail(await api(`/jobs/${id}`));
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    setRejecting(false);
    setReason('');
    loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const approve = async () => {
    setActing(true);
    try {
      await api(`/jobs/${selectedId}/approve`, { method: 'POST' });
      notify('Job approved and now live');
      await Promise.all([loadJobs(), loadDetail(selectedId)]);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setActing(false);
    }
  };

  const disapprove = async () => {
    if (!reason.trim()) return notify('Enter a reason first', 'error');
    setActing(true);
    try {
      await api(`/jobs/${selectedId}/disapprove`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      notify('Job disapproved and taken offline');
      setRejecting(false);
      setReason('');
      await Promise.all([loadJobs(), loadDetail(selectedId)]);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setActing(false);
    }
  };

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submitJob = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          openings: Number(form.openings),
          budget: Number(form.budget),
          skillsRequired: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      setShowForm(false);
      setForm(emptyForm);
      notify('Job posted and live');
      if (tab === 'approved') loadJobs(); else setTab('approved');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const job = detail?.job;
  const poster = detail?.poster;

  return (
    <div className="aj">
      <style>{css}</style>

      <header className="aj-head">
        <div>
          <h1>Job approvals</h1>
          <p>Only approved jobs are visible to providers.</p>
        </div>
        <button className="aj-btn aj-btn-primary" onClick={() => setShowForm(true)}>
          Post a job
        </button>
      </header>

      <div className="aj-bar">
        <div className="aj-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`aj-tab ${tab === t.key ? 'is-on' : ''}`}
              onClick={() => { setTab(t.key); setPage(1); setSelectedId(null); }}
            >
              {t.label} <span className="aj-count">{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <input
          className="aj-input aj-search"
          type="search"
          placeholder="Search title, category or client"
          aria-label="Search jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="aj-grid">
        {/* ── List ── */}
        <section className="aj-list" aria-label="Jobs">
          {loading && <p className="aj-empty">Loading jobs...</p>}
          {!loading && jobs.length === 0 && (
            <p className="aj-empty">
              {tab === 'pending' ? 'No jobs are waiting for review.' : 'No jobs found.'}
            </p>
          )}
          {!loading && jobs.map((j) => (
            <button
              key={j._id}
              className={`aj-row ${selectedId === j._id ? 'is-on' : ''}`}
              onClick={() => setSelectedId(j._id)}
            >
              <span className="aj-row-title">{j.title}</span>
              <span className="aj-row-meta">
                {posterName(j)}{j.postedByAdmin ? ' (admin post)' : ''} - {j.category}
              </span>
              <span className="aj-row-meta">
                {naira(j.budget)} - {fmtDate(j.createdAt)}
              </span>
            </button>
          ))}
          {pages > 1 && (
            <div className="aj-pager">
              <button className="aj-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span>Page {page} of {pages}</span>
              <button className="aj-btn" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </section>

        {/* ── Details ── */}
        <section className="aj-detail" aria-live="polite">
          {!selectedId && <p className="aj-empty">Select a job to review it.</p>}
          {selectedId && detailLoading && !job && <p className="aj-empty">Loading details...</p>}

          {job && (
            <>
              <div className="aj-detail-top">
                <div>
                  <h2>{job.title}</h2>
                  <div className="aj-badges">
                    <span className={`aj-badge aj-${job.approvalStatus}`}>
                      {job.approvalStatus === 'approved' ? 'Live' : job.approvalStatus === 'rejected' ? 'Disapproved' : 'Pending review'}
                    </span>
                    <span className="aj-badge">{job.plan} plan</span>
                    <span className="aj-badge">{job.type}</span>
                    <span className="aj-badge">{job.status}</span>
                  </div>
                </div>
                <div className="aj-actions">
                  {job.approvalStatus !== 'approved' && (
                    <button className="aj-btn aj-btn-primary" disabled={acting} onClick={approve}>
                      Approve job
                    </button>
                  )}
                  {job.approvalStatus !== 'rejected' && !rejecting && (
                    <button className="aj-btn aj-btn-danger" disabled={acting} onClick={() => setRejecting(true)}>
                      {job.approvalStatus === 'approved' ? 'Take down' : 'Disapprove'}
                    </button>
                  )}
                </div>
              </div>

              {rejecting && (
                <div className="aj-reject">
                  <label htmlFor="aj-reason">Reason (the client will need this to fix the job)</label>
                  <textarea
                    id="aj-reason"
                    className="aj-input"
                    rows={3}
                    maxLength={500}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="aj-actions">
                    <button className="aj-btn aj-btn-danger" disabled={acting} onClick={disapprove}>
                      Confirm disapproval
                    </button>
                    <button className="aj-btn" onClick={() => { setRejecting(false); setReason(''); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {job.approvalStatus === 'rejected' && job.rejectionReason && (
                <div className="aj-note">
                  <strong>Disapproved on {fmtDate(job.rejectedAt)}</strong>
                  {job.rejectedBy && ` by ${job.rejectedBy.firstName} ${job.rejectedBy.lastName}`}
                  <p>{job.rejectionReason}</p>
                </div>
              )}
              {job.approvalStatus === 'approved' && (
                <p className="aj-muted">
                  Approved on {fmtDate(job.approvedAt)}
                  {job.approvedBy && ` by ${job.approvedBy.firstName} ${job.approvedBy.lastName}`}
                  {job.expiresAt && `. Expires ${fmtDate(job.expiresAt)}.`}
                </p>
              )}

              <h3>Job details</h3>
              <dl className="aj-dl">
                <dt>Budget</dt><dd>{naira(job.budget)}</dd>
                <dt>Openings</dt><dd>{job.openings}</dd>
                <dt>Category</dt><dd>{job.category}</dd>
                <dt>Speciality</dt><dd>{job.speciality}</dd>
                <dt>Work mode</dt><dd>{job.mode || '-'}</dd>
                <dt>Location</dt>
                <dd>{[job.address, job.lga, job.state].filter(Boolean).join(', ') || '-'}</dd>
                <dt>Submitted</dt><dd>{fmtDate(job.createdAt)}</dd>
                <dt>Skills</dt><dd>{job.skillsRequired?.length ? job.skillsRequired.join(', ') : '-'}</dd>
                <dt>Benefits</dt>
                <dd>{job.jobBenefits?.length ? job.jobBenefits.join(', ') : '-'}{job.otherBenefits ? `, ${job.otherBenefits}` : ''}</dd>
              </dl>
              <p className="aj-desc">{job.description}</p>

              <h3>Posted by</h3>
              {poster ? (
                <div className="aj-poster">
                  <div className="aj-avatar">
                    {poster.profilePicture
                      ? <img src={poster.profilePicture} alt="" />
                      : initials(poster)}
                  </div>
                  <div>
                    <strong>{poster.firstName} {poster.lastName}</strong>
                    {poster.isVerified && <span className="aj-badge aj-approved">Verified</span>}
                    {poster.isBlacklisted && <span className="aj-badge aj-rejected">Blacklisted</span>}
                    <dl className="aj-dl">
                      <dt>Email</dt><dd>{poster.email}</dd>
                      <dt>Phone</dt><dd>{poster.phoneNumber || '-'}</dd>
                      <dt>Location</dt>
                      <dd>{[poster.address, poster.lga, poster.state].filter(Boolean).join(', ') || '-'}</dd>
                      <dt>Business</dt><dd>{poster.businessProfile?.businessName || '-'}</dd>
                      <dt>Member since</dt><dd>{fmtDate(poster.createdAt)}</dd>
                      {detail.posterStats && (
                        <>
                          <dt>Jobs posted</dt>
                          <dd>
                            {detail.posterStats.totalJobs} total, {detail.posterStats.approvedJobs} approved,{' '}
                            {detail.posterStats.rejectedJobs} disapproved
                          </dd>
                        </>
                      )}
                    </dl>
                  </div>
                </div>
              ) : (
                <div className="aj-poster">
                  <div className="aj-avatar">?</div>
                  <div>
                    <strong>{job.clientName || 'Unknown'}</strong>
                    <p className="aj-muted">
                      No client account attached.
                      {job.postedBy && ` Posted by admin ${job.postedBy.firstName} ${job.postedBy.lastName}.`}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Post job modal ── */}
      {showForm && (
        <div className="aj-overlay" role="dialog" aria-modal="true" aria-labelledby="aj-form-title">
          <form className="aj-modal" onSubmit={submitJob}>
            <h2 id="aj-form-title">Post a job</h2>
            <p className="aj-muted">Jobs posted here go live immediately.</p>

            <div className="aj-form-grid">
              <label className="aj-span2">Client name
                <input className="aj-input" value={form.clientName} onChange={setField('clientName')}
                  placeholder="Leave blank to show Unknown" />
              </label>
              <label className="aj-span2">Job title
                <input className="aj-input" required value={form.title} onChange={setField('title')} />
              </label>
              <label>Category
                <input className="aj-input" required value={form.category} onChange={setField('category')} />
              </label>
              <label>Speciality
                <input className="aj-input" required value={form.speciality} onChange={setField('speciality')} />
              </label>
              <label>Budget (NGN)
                <input className="aj-input" type="number" min="0" required value={form.budget} onChange={setField('budget')} />
              </label>
              <label>Openings
                <input className="aj-input" type="number" min="1" required value={form.openings} onChange={setField('openings')} />
              </label>
              <label>Pay type
                <select className="aj-input" value={form.type} onChange={setField('type')}>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </label>
              <label>Plan
                <select className="aj-input" value={form.plan} onChange={setField('plan')}>
                  <option value="basic">Basic (7 days)</option>
                  <option value="premium">Premium (30 days)</option>
                  <option value="gold">Gold (90 days)</option>
                </select>
              </label>
              <label>Work mode
                <input className="aj-input" value={form.mode} onChange={setField('mode')} placeholder="onsite, remote, contract..." />
              </label>
              <label>State
                <input className="aj-input" value={form.state} onChange={setField('state')} />
              </label>
              <label>LGA
                <input className="aj-input" value={form.lga} onChange={setField('lga')} />
              </label>
              <label>Address
                <input className="aj-input" value={form.address} onChange={setField('address')} />
              </label>
              <label className="aj-span2">Skills (comma separated)
                <input className="aj-input" value={form.skills} onChange={setField('skills')} />
              </label>
              <label className="aj-span2">Description
                <textarea className="aj-input" rows={5} required value={form.description} onChange={setField('description')} />
              </label>
            </div>

            {formError && <p className="aj-error" role="alert">{formError}</p>}

            <div className="aj-actions aj-end">
              <button type="button" className="aj-btn" onClick={() => { setShowForm(false); setFormError(''); }}>
                Cancel
              </button>
              <button type="submit" className="aj-btn aj-btn-primary" disabled={saving}>
                {saving ? 'Posting...' : 'Post job'}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className={`aj-toast ${toast.type === 'error' ? 'is-error' : ''}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}

const css = `
.aj { --bg:#f4f6f7; --card:#fff; --ink:#18232d; --muted:#5d6b78; --line:#dce2e7;
  --ok:#0f6b5c; --ok-bg:#dff3ee; --bad:#a8271f; --bad-bg:#fbe5e3; --wait:#7a5200; --wait-bg:#fbefd0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color:var(--ink);
  background:var(--bg); min-height:100%; padding:24px; box-sizing:border-box; }
.aj *, .aj *::before, .aj *::after { box-sizing:border-box; }
.aj h1 { font-size:22px; margin:0 0 2px; }
.aj h2 { font-size:19px; margin:0 0 8px; }
.aj h3 { font-size:14px; margin:22px 0 8px; padding-top:16px; border-top:1px solid var(--line); }
.aj p { margin:0; }
.aj-head { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
.aj-head p, .aj-muted { color:var(--muted); font-size:14px; }
.aj-bar { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
.aj-tabs { display:flex; gap:6px; flex-wrap:wrap; }
.aj-tab { border:1px solid var(--line); background:var(--card); padding:8px 14px; border-radius:8px;
  font:inherit; font-size:14px; cursor:pointer; color:var(--ink); }
.aj-tab.is-on { background:var(--ink); color:#fff; border-color:var(--ink); }
.aj-count { margin-left:4px; opacity:.7; }
.aj-input { width:100%; padding:9px 11px; border:1px solid var(--line); border-radius:8px; font:inherit;
  font-size:14px; background:#fff; color:var(--ink); }
.aj-search { width:280px; max-width:100%; }
.aj-btn { border:1px solid var(--line); background:#fff; padding:9px 14px; border-radius:8px; font:inherit;
  font-size:14px; cursor:pointer; color:var(--ink); }
.aj-btn:disabled { opacity:.5; cursor:not-allowed; }
.aj-btn-primary { background:var(--ok); border-color:var(--ok); color:#fff; }
.aj-btn-danger { background:#fff; border-color:var(--bad); color:var(--bad); }
.aj button:focus-visible, .aj .aj-input:focus-visible { outline:2px solid #2563eb; outline-offset:2px; }
.aj-grid { display:grid; grid-template-columns:minmax(280px,380px) 1fr; gap:16px; align-items:start; }
.aj-list, .aj-detail { background:var(--card); border:1px solid var(--line); border-radius:12px; }
.aj-list { display:flex; flex-direction:column; max-height:calc(100vh - 200px); overflow:auto; }
.aj-detail { padding:22px; min-height:320px; }
.aj-row { text-align:left; border:0; border-bottom:1px solid var(--line); background:transparent; padding:13px 16px;
  display:flex; flex-direction:column; gap:3px; cursor:pointer; font:inherit; color:var(--ink); }
.aj-row:hover { background:#f8fafb; }
.aj-row.is-on { background:#eef6f4; box-shadow:inset 3px 0 0 var(--ok); }
.aj-row-title { font-weight:600; font-size:15px; }
.aj-row-meta { font-size:13px; color:var(--muted); }
.aj-empty { padding:28px 20px; color:var(--muted); font-size:14px; }
.aj-pager { display:flex; justify-content:space-between; align-items:center; padding:12px; font-size:13px; color:var(--muted); }
.aj-detail-top { display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.aj-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:flex-start; }
.aj-end { justify-content:flex-end; margin-top:16px; }
.aj-badges { display:flex; gap:6px; flex-wrap:wrap; }
.aj-badge { display:inline-block; font-size:12px; padding:3px 9px; border-radius:99px; background:#eceff2; color:var(--muted); margin-left:0; }
.aj-poster .aj-badge { margin-left:8px; }
.aj-badge.aj-approved { background:var(--ok-bg); color:var(--ok); }
.aj-badge.aj-rejected { background:var(--bad-bg); color:var(--bad); }
.aj-badge.aj-pending { background:var(--wait-bg); color:var(--wait); }
.aj-reject { margin:16px 0; padding:14px; border:1px solid var(--bad); border-radius:10px; background:#fff8f7; display:grid; gap:8px; font-size:14px; }
.aj-note { margin:16px 0; padding:12px 14px; border-radius:10px; background:var(--bad-bg); color:var(--bad); font-size:14px; }
.aj-note p { margin-top:4px; color:var(--ink); }
.aj-dl { display:grid; grid-template-columns:120px 1fr; gap:6px 12px; margin:0; font-size:14px; }
.aj-dl dt { color:var(--muted); }
.aj-dl dd { margin:0; overflow-wrap:anywhere; }
.aj-desc { margin-top:14px; white-space:pre-wrap; font-size:14px; line-height:1.6; max-width:70ch; }
.aj-poster { display:flex; gap:14px; align-items:flex-start; }
.aj-poster .aj-dl { margin-top:8px; }
.aj-avatar { width:52px; height:52px; border-radius:50%; background:#dde6ea; display:grid; place-items:center;
  font-weight:600; color:var(--muted); flex:none; overflow:hidden; }
.aj-avatar img { width:100%; height:100%; object-fit:cover; }
.aj-overlay { position:fixed; inset:0; background:rgba(15,25,35,.5); display:grid; place-items:center; padding:16px; z-index:50; }
.aj-modal { background:#fff; border-radius:14px; padding:24px; width:100%; max-width:640px; max-height:92vh; overflow:auto; }
.aj-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px; }
.aj-form-grid label { display:grid; gap:5px; font-size:13px; color:var(--muted); }
.aj-span2 { grid-column:1 / -1; }
.aj-error { color:var(--bad); font-size:14px; margin-top:12px; }
.aj-toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--ink); color:#fff;
  padding:11px 18px; border-radius:10px; font-size:14px; z-index:60; }
.aj-toast.is-error { background:var(--bad); }
@media (max-width: 860px) {
  .aj { padding:14px; }
  .aj-grid { grid-template-columns:1fr; }
  .aj-list { max-height:320px; }
  .aj-form-grid { grid-template-columns:1fr; }
  .aj-dl { grid-template-columns:100px 1fr; }
}
`;