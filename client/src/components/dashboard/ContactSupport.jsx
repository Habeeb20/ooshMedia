import { useEffect, useState } from 'react';
import { Phone, MapPin, Mail,  Send, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Adjust to wherever your app stores these — kept as constants so
// there's one place to edit if your details change.
const CONTACT_INFO = {
  phone: '+234 8155556666',
  location: '31 iyalla street Street, Alausa, Ikeja, Lagos, NG',
  email: 'support@estores.com',
//   facebook: 'https://facebook.com',
//   linkedin: 'https://linkedin.com/company',
};

export default function ContactSupport() {
  const [profile, setProfile] = useState(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Adjust this endpoint to whatever your "get my profile" route actually is
    fetch(`${BACKEND_URL}/api/auth/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data.data || data.user))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in the subject and message.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to submit a support ticket.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, description }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Something went wrong.');

      toast.success("Message sent — we'll get back to you shortly.");
      setSubmitted(true);
      setSubject('');
      setDescription('');
    } catch (err) {
      toast.error(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-[#FBF7F5] py-12 px-4 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(139,30,63,0.25)] ring-1 ring-black/5">
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* LEFT — Contact details */}
          <div className="relative col-span-2 flex flex-col justify-between bg-[#8B1E3F] px-8 py-10 text-white sm:px-10 sm:py-12">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/10"
              aria-hidden="true"
            />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Get in touch
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Contact Details
              </h2>
              <div className="mt-1 h-1 w-10 rounded-full bg-white/40" />

              <div className="mt-8 space-y-6">
                <InfoRow icon={Phone} label="Phone" value={CONTACT_INFO.phone} />
                <InfoRow icon={MapPin} label="Location" value={CONTACT_INFO.location} />
                <InfoRow icon={Mail} label="Email" value={CONTACT_INFO.email } />
              </div>
            </div>

            <div className="relative mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Follow us
              </p>
              {/* <div className="mt-3 flex gap-3">
                <SocialIcon href={CONTACT_INFO.facebook} icon={Facebook} label="Facebook" />
                <SocialIcon href={CONTACT_INFO.linkedin} icon={Linkedin} label="LinkedIn" />
              </div> */}
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="col-span-3 px-8 py-10 sm:px-10 sm:py-12">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-[#8B1E3F]" />
                <h3 className="mt-4 text-lg font-semibold text-slate-800">Message sent</h3>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Our support team has received your ticket and will reach out to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-medium text-[#8B1E3F] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-slate-800">Send us a message</h3>
                <p className="mt-1 text-sm text-slate-500">
                  We typically respond within one business day.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Name"
                      value={profile ? `${profile.firstName} ${profile.lastName}` : ''}
                      readOnly
                      placeholder="Your name"
                    />
                    <Field
                      label="Email"
                      value={profile?.email || profile?.alternateContact || ''}
                      readOnly
                      placeholder="you@email.com"
                    />
                  </div>

                  <Field
                    label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What can we help with?"
                    maxLength={255}
                  />

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Message
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      placeholder="Describe your issue in detail..."
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#8B1E3F] focus:bg-white focus:ring-2 focus:ring-[#8B1E3F]/15"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#8B1E3F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#75182f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Submit Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/15">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-white/60">{label}</p>
        <p className="text-sm font-medium leading-snug text-white/95">{value}</p>
      </div>
    </div>
  );
}

function SocialIcon({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

function Field({ label, readOnly, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      <input
        readOnly={readOnly}
        {...props}
        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
          readOnly
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
            : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-[#8B1E3F] focus:bg-white focus:ring-2 focus:ring-[#8B1E3F]/15'
        }`}
      />
    </div>
  );
}