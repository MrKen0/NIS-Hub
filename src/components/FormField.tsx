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
    <label className="space-y-1 text-sm font-medium text-slate-700" htmlFor={inputId}>
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      {textarea ? (
        <textarea
          id={inputId}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      )}
    </label>
  );
}
