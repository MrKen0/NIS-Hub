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
    <label className="space-y-1 text-sm font-medium text-slate-700" htmlFor={inputId}>
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
