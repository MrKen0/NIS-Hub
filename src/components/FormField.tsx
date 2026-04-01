interface FormFieldProps {
  id?: string;
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  required?: boolean;
  rows?: number;
  min?: string;
}

const inputClass = `
  w-full rounded-xl border bg-white px-4 py-3 text-sm
  text-slate-900 placeholder-slate-400
  transition-colors
  focus:outline-none focus:ring-2
  focus:border-[#008753] focus:ring-[#008753]/20
`.trim().replace(/\s+/g, ' ');

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  textarea,
  required = false,
  rows,
  min,
}: FormFieldProps) {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold"
        style={{ color: 'var(--color-text)' }}
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={inputId}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)' }}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          className={inputClass}
          style={{ borderColor: 'var(--color-border)' }}
        />
      )}
    </div>
  );
}
