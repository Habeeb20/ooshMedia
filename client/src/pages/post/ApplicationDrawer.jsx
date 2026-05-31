import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, BookmarkCheck, ChevronDown, MapPin, Phone, Mail } from 'lucide-react';
import { feedAPI } from '../../config/api';


const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: '#92400e', bg: '#fffbeb', icon: Clock },
  shortlisted: { label: 'Shortlisted', color: '#1d4ed8', bg: '#eff6ff', icon: BookmarkCheck },
  accepted:    { label: 'Accepted',    color: '#065f46', bg: '#ecfdf5', icon: CheckCircle },
  rejected:    { label: 'Rejected',    color: '#991b1b', bg: '#fef2f2', icon: XCircle },
};

export default function ApplicationsDrawer({ post, onClose, onUpdate }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await feedAPI.getApplications(post._id);
      setApplications(res.data.data);
    } catch {}
    setLoading(false);
  };

  const handleStatusChange = async (appId, status) => {
    setUpdating(appId);
    try {
      await feedAPI.updateApplicationStatus(post._id, appId, status);
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, status } : a)
      );
      onUpdate?.();
    } catch {}
    setUpdating(null);
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <div style={overlayStyle}>
      <div style={drawerStyle}>
        <div style={headerStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>Applications</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{post.title || post.content.slice(0, 50)}</p>
          </div>
          <button onClick={onClose} style={closeBtn}><X size={20} /></button>
        </div>

        {/* Filter tabs */}
        <div style={filterRow}>
          {['all', 'pending', 'shortlisted', 'accepted', 'rejected'].map(f => {
            const count = f === 'all' ? applications.length : applications.filter(a => a.status === f).length;
            return (
              <button
                key={f}
                style={{ ...filterBtn, ...(filter === f ? filterBtnActive : {}) }}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        <div style={listStyle}>
          {loading && <div style={emptyStyle}>Loading applications...</div>}
          {!loading && filtered.length === 0 && (
            <div style={emptyStyle}>No {filter === 'all' ? '' : filter} applications yet</div>
          )}

          {filtered.map(app => {
            const applicant = app.applicant;
            const cfg = STATUS_CONFIG[app.status];
            const StatusIcon = cfg.icon;
            const isOpen = expanded === app._id;

            return (
              <div key={app._id} style={appCard}>
                <div style={appHeader} onClick={() => setExpanded(isOpen ? null : app._id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={avatarStyle}>
                      {applicant?.profilePicture
                        ? <img src={applicant.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : <span style={{ fontSize: 13, fontWeight: 700, color: '#3949ab' }}>
                            {applicant?.firstName?.[0]}{applicant?.lastName?.[0]}
                          </span>
                      }
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#111' }}>
                        {applicant?.firstName} {applicant?.lastName}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
                        {applicant?.businessProfile?.businessName || applicant?.username}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ ...statusBadge, background: cfg.bg, color: cfg.color }}>
                      <StatusIcon size={11} />
                      {cfg.label}
                    </span>
                    <ChevronDown size={16} style={{ color: '#888', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </div>

                {isOpen && (
                  <div style={appBody}>
                    {/* Applicant details */}
                    <div style={detailRow}>
                      {applicant?.email && <span style={detailItem}><Mail size={12} />{applicant.email}</span>}
                      {applicant?.phoneNumber && <span style={detailItem}><Phone size={12} />{applicant.phoneNumber}</span>}
                      {applicant?.state && <span style={detailItem}><MapPin size={12} />{applicant.state}{applicant.lga ? `, ${applicant.lga}` : ''}</span>}
                    </div>

                    {/* Proposed price */}
                    {app.proposedPrice > 0 && (
                      <div style={proposedPrice}>
                        💰 Proposed: <strong>₦{app.proposedPrice.toLocaleString()}</strong>
                      </div>
                    )}

                    {/* Cover letter */}
                    {app.coverLetter && (
                      <div style={coverLetterBox}>
                        <p style={coverLetterLabel}>Cover Letter</p>
                        <p style={coverLetterText}>{app.coverLetter}</p>
                      </div>
                    )}

                    {/* Applied date */}
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '8px 0 12px' }}>
                      Applied {new Date(app.appliedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>

                    {/* Action buttons */}
                    <div style={actionBtns}>
                      {['shortlisted', 'accepted', 'rejected'].map(s => (
                        <button
                          key={s}
                          disabled={updating === app._id || app.status === s}
                          style={{
                            ...actionBtn,
                            background: STATUS_CONFIG[s].bg,
                            color: STATUS_CONFIG[s].color,
                            opacity: app.status === s ? 0.5 : 1,
                            cursor: app.status === s ? 'default' : 'pointer'
                          }}
                          onClick={() => handleStatusChange(app._id, s)}
                        >
                          {updating === app._id ? '...' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', justifyContent: 'flex-end' };
const drawerStyle = { background: '#fff', width: '100%', maxWidth: 480, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid #f0f0f0', flexShrink: 0 };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex' };
const filterRow = { display: 'flex', overflowX: 'auto', gap: 4, padding: '10px 1.25rem', borderBottom: '1px solid #f0f0f0', flexShrink: 0 };
const filterBtn = { padding: '5px 12px', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fafafa', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#555', whiteSpace: 'nowrap', flexShrink: 0 };
const filterBtnActive = { background: '#1e40af', color: '#fff', borderColor: '#1e40af' };
const listStyle = { flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' };
const emptyStyle = { textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: 14 };
const appCard = { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 10, marginBottom: 10, overflow: 'hidden' };
const appHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', cursor: 'pointer' };
const avatarStyle = { width: 38, height: 38, borderRadius: '50%', background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 };
const statusBadge = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 };
const appBody = { padding: '0 14px 14px', borderTop: '1px solid #f9fafb' };
const detailRow = { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '10px 0' };
const detailItem = { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#555', background: '#f3f4f6', padding: '3px 8px', borderRadius: 6 };
const proposedPrice = { fontSize: 13, color: '#374151', margin: '8px 0', padding: '8px 10px', background: '#f0fdf4', borderRadius: 6 };
const coverLetterBox = { background: '#f9fafb', borderRadius: 8, padding: '10px 12px', margin: '8px 0', border: '1px solid #f0f0f0' };
const coverLetterLabel = { margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 };
const coverLetterText = { margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 };
const actionBtns = { display: 'flex', gap: 6, flexWrap: 'wrap' };
const actionBtn = { padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' };