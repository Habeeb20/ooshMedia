import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Wallet,
  Bike,
  Store,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  User as UserIcon,
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const PAYOUT_STATUS_META = {
  owed: { label: 'Owed', dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
  paid: { label: 'Paid', dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  payout_failed: { label: 'Failed', dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  not_applicable: { label: 'N/A', dot: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50' },
};

const TYPE_LABEL = {
  sale_share: 'Seller share',
  platform_fee: 'Platform fee',
  transport_fee: 'Transport fee',
};

const naira = (n) =>
  `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const personName = (u) => {
  if (!u) return '—';
  return u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.username || u.email || '—';
};

const AdminSettlements = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [filters, setFilters] = useState({
    payoutStatus: '',
    type: '',
    search: '',
  });

  const token = localStorage.getItem('adminToken');

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: pagination.limit };
        if (filters.payoutStatus) params.payoutStatus = filters.payoutStatus;
        if (filters.type) params.type = filters.type;
        if (filters.search) params.search = filters.search;

        const { data } = await axios.get(`${BACKEND_URL}/api/admin/settlements`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setRows(data.rows);
        setPagination(data.pagination);
        setSummary(data.summary);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load settlement history');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.payoutStatus, filters.type, filters.search, pagination.limit]
  );

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.payoutStatus, filters.type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1);
  };

  const handlePay = async (row) => {
    const recipient =
      row.type === 'transport_fee' ? personName(row.rider) : personName(row.seller) || row.seller?.sellerProfile?.shopName;
    const amount = row.type === 'transport_fee' ? row.riderAmount ?? row.amount : row.amount;

    if (!window.confirm(`Send ${naira(amount)} to ${recipient} via Paystack now? This cannot be undone.`)) return;

    setPayingId(row._id);
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/api/admin/settlements/${row._id}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message || 'Payout sent');
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payout failed');
      fetchData(pagination.page);
    } finally {
      setPayingId(null);
    }
  };

  const isPayable = (row) => ['owed', 'payout_failed'].includes(row.payoutStatus);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-indigo-600" />
              Settlements &amp; Payouts
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Full audit trail of every order's money movement — seller shares, platform fees, and rider transport fees.
            </p>
          </div>
          <button
            onClick={() => fetchData(pagination.page)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={Store}
              label="Owed to sellers"
              value={naira(summary.sellersOwed.total)}
              sub={`${summary.sellersOwed.count} pending row${summary.sellersOwed.count === 1 ? '' : 's'}`}
              tone="red"
            />
            <SummaryCard
              icon={Bike}
              label="Owed to riders"
              value={naira(summary.ridersOwed.total)}
              sub={`${summary.ridersOwed.count} pending row${summary.ridersOwed.count === 1 ? '' : 's'}`}
              tone="red"
            />
            <SummaryCard
              icon={CheckCircle2}
              label="Total paid out"
              value={naira(summary.totalPaidOut.total)}
              sub={`${summary.totalPaidOut.count} payout${summary.totalPaidOut.count === 1 ? '' : 's'}`}
              tone="green"
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Failed payouts"
              value={summary.failedPayouts}
              sub="Need a retry"
              tone={summary.failedPayouts > 0 ? 'amber' : 'gray'}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Filter className="h-4 w-4" /> Filters
          </div>

          <select
            value={filters.payoutStatus}
            onChange={(e) => setFilters((f) => ({ ...f, payoutStatus: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All payout statuses</option>
            <option value="owed">Owed</option>
            <option value="paid">Paid</option>
            <option value="payout_failed">Failed</option>
            <option value="not_applicable">Not applicable</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All types</option>
            <option value="sale_share">Seller share</option>
            <option value="platform_fee">Platform fee</option>
            <option value="transport_fee">Transport fee</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[220px]">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Search order number…"
                className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button type="submit" className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
              Go
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Collected</th>
                  <th className="px-4 py-3">Payout status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      Loading settlement history…
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      No settlement rows match these filters.
                    </td>
                  </tr>
                )}

                {!loading &&
                  rows.map((row) => {
                    const isTransport = row.type === 'transport_fee';
                    const recipient = isTransport ? row.rider : row.seller;
                    const amount = isTransport ? row.riderAmount ?? row.amount : row.amount;
                    const payoutMeta = PAYOUT_STATUS_META[row.payoutStatus] || PAYOUT_STATUS_META.not_applicable;
                    const owed = row.payoutStatus === 'owed' || row.payoutStatus === 'payout_failed';
                    const expanded = expandedId === row._id;

                    return (
                      <React.Fragment key={row._id}>
                        <tr
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setExpandedId(expanded ? null : row._id)}
                        >
                          <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                            {row.order?.orderNumber || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{TYPE_LABEL[row.type]}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{personName(row.order?.buyer)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {recipient ? (
                              <span className="flex items-center gap-1.5 text-gray-700">
                                {isTransport ? <Bike className="h-3.5 w-3.5 text-gray-400" /> : <Store className="h-3.5 w-3.5 text-gray-400" />}
                                {personName(recipient)}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">
                                {isTransport ? 'No rider assigned' : 'Estore (platform)'}
                              </span>
                            )}
                          </td>
                          <td
                            className={`px-4 py-3 font-semibold whitespace-nowrap ${
                              owed ? 'text-red-600' : 'text-gray-800'
                            }`}
                          >
                            {naira(amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusPill status={row.status} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${payoutMeta.bg} ${payoutMeta.text}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${payoutMeta.dot}`} />
                              {payoutMeta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            {isPayable(row) ? (
                              <button
                                onClick={() => handlePay(row)}
                                disabled={payingId === row._id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition ${
                                  row.payoutStatus === 'payout_failed'
                                    ? 'bg-amber-600 hover:bg-amber-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                              >
                                <Send className="h-3.5 w-3.5" />
                                {payingId === row._id
                                  ? 'Sending…'
                                  : row.payoutStatus === 'payout_failed'
                                  ? 'Retry payout'
                                  : 'Pay now'}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                        </tr>

                        {expanded && (
                          <tr className="bg-gray-50/70">
                            <td colSpan={8} className="px-4 py-4">
                              <RowDetail row={row} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>
              Page {pagination.page} of {pagination.pages || 1} · {pagination.total} rows
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchData(pagination.page - 1)}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchData(pagination.page + 1)}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, sub, tone }) => {
  const toneMap = {
    red: 'text-red-600 bg-red-50',
    green: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    gray: 'text-gray-500 bg-gray-50',
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className={`text-xl font-bold mt-1 ${tone === 'red' ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const meta = {
    pending: { icon: Clock, text: 'text-gray-500', bg: 'bg-gray-100' },
    completed: { icon: CheckCircle2, text: 'text-emerald-600', bg: 'bg-emerald-50' },
    failed: { icon: AlertTriangle, text: 'text-red-600', bg: 'bg-red-50' },
  }[status] || { icon: Clock, text: 'text-gray-500', bg: 'bg-gray-100' };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.text}`}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  );
};

const RowDetail = ({ row }) => {
  const order = row.order;
  const buyer = order?.buyer;
  const recipient = row.type === 'transport_fee' ? row.rider : row.seller;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
      <DetailBlock title="Order" icon={UserIcon}>
        <Line label="Order #" value={order?.orderNumber} />
        <Line label="Total amount" value={naira(order?.totalAmount)} />
        <Line label="Platform fee" value={naira(order?.totalPlatformFee)} />
        <Line label="Transport fee" value={naira(order?.transportFee)} />
        <Line label="Payment method" value={order?.paymentMethod} />
        <Line label="Payment status" value={order?.paymentStatus} />
        <Line label="Fulfillment" value={order?.fulfillmentType} />
      </DetailBlock>

      <DetailBlock title="Buyer" icon={UserIcon}>
        <Line label="Name" value={personName(buyer)} />
        <Line label="Email" value={buyer?.email} />
        <Line label="Phone" value={buyer?.phoneNumber} />
      </DetailBlock>

      <DetailBlock title={row.type === 'transport_fee' ? 'Rider' : 'Seller'} icon={row.type === 'transport_fee' ? Bike : Store}>
        {recipient ? (
          <>
            <Line label="Name" value={personName(recipient)} />
            <Line label="Email" value={recipient?.email} />
            <Line label="Phone" value={recipient?.phoneNumber} />
            {row.type === 'sale_share' && (
              <>
                <Line label="Shop" value={recipient?.sellerProfile?.shopName} />
                <Line
                  label="Bank"
                  value={
                    recipient?.sellerProfile?.bankDetails?.bankName
                      ? `${recipient.sellerProfile.bankDetails.bankName} · ${recipient.sellerProfile.bankDetails.accountNumber || ''}`
                      : 'Not on file'
                  }
                />
              </>
            )}
            {row.type === 'transport_fee' && (
              <>
                <Line label="Vehicle" value={recipient?.riderProfile?.vehicleType} />
                <Line
                  label="Bank"
                  value={
                    recipient?.riderProfile?.bankName
                      ? `${recipient.riderProfile.bankName} · ${recipient.riderProfile.accountNumber || ''}`
                      : 'Not on file'
                  }
                />
              </>
            )}
          </>
        ) : (
          <p className="text-gray-400 italic">
            {row.type === 'transport_fee' ? 'No rider assigned yet' : 'Platform / estore'}
          </p>
        )}

        {row.payoutStatus === 'payout_failed' && row.payoutError && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1.5">{row.payoutError}</p>
        )}
        {row.payoutStatus === 'paid' && (
          <p className="mt-2 text-xs text-emerald-600">
            Paid {row.paidAt ? new Date(row.paidAt).toLocaleString() : ''} {row.paidBy ? `by ${personName(row.paidBy)}` : ''}
          </p>
        )}
      </DetailBlock>
    </div>
  );
};

const DetailBlock = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-3">
    <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
      <Icon className="h-3.5 w-3.5" /> {title}
    </p>
    <div className="space-y-1">{children}</div>
  </div>
);

const Line = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-gray-400 text-xs">{label}</span>
    <span className="text-gray-700 text-xs font-medium text-right">{value || '—'}</span>
  </div>
);

export default AdminSettlements;