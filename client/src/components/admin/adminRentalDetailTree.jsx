const WINE = '#8B1E3F';

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
}

function looksLikeIsoDate(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v);
}

function formatPrimitive(value) {
  if (value === null || value === undefined || value === '') return <span className="text-[#B7ABB1] italic">—</span>;
  if (typeof value === 'boolean') return value ? '✅ Yes' : '❌ No';
  if (looksLikeIsoDate(value)) return new Date(value).toLocaleString('en-NG');
  return String(value);
}

function fieldLabel(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

// Recursively renders any plain object/array/primitive as labeled rows,
// nesting sub-objects visually. Skips Mongoose/Mongo internals (_id,
// __v, timestamps handled separately by the caller if desired).
export default function DetailTree({ data, skipKeys = ['__v'], depth = 0 }) {
  if (data === null || data === undefined) return <span className="text-[#B7ABB1] italic">—</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-[#B7ABB1] italic">None</span>;
    return (
      <div className="space-y-2">
        {data.map((entry, i) => (
          <div key={i} className="rounded-lg border border-[#F3E4E8] p-2">
            {isPlainObject(entry) ? (
              <DetailTree data={entry} skipKeys={skipKeys} depth={depth + 1} />
            ) : (
              formatPrimitive(entry)
            )}
          </div>
        ))}
      </div>
    );
  }

  if (isPlainObject(data)) {
    const entries = Object.entries(data).filter(([k]) => !skipKeys.includes(k));
    if (entries.length === 0) return <span className="text-[#B7ABB1] italic">Empty</span>;
    return (
      <div className={depth > 0 ? 'pl-3 border-l-2 border-[#F3E4E8] space-y-2' : 'space-y-2'}>
        {entries.map(([key, value]) => {
          const nested = isPlainObject(value) || (Array.isArray(value) && value.some(isPlainObject));
          return (
            <div key={key} className={nested ? '' : 'flex justify-between gap-4 py-1 text-sm border-b border-[#F9F0F2] last:border-0'}>
              <span className="text-[#6B6067] shrink-0" style={nested ? { fontWeight: 600, color: WINE, display: 'block', marginBottom: 4 } : {}}>
                {fieldLabel(key)}
              </span>
              {nested ? (
                <DetailTree data={value} skipKeys={skipKeys} depth={depth + 1} />
              ) : (
                <span className="text-[#221B1D] text-right break-words">{formatPrimitive(value)}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <span>{formatPrimitive(data)}</span>;
}