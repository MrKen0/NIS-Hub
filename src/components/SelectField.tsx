interface SelectFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  required?: boolean;
}

export default function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
}: SelectFieldProps) {
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
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:border-[#008753] focus:ring-[#008753]/20 min-h-[44px]"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
