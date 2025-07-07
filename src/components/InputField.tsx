interface InputFormProps {
  label: string;
  placeholder?: string;
  value?: string;
  type?: string;
  large?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  darkMode?: boolean;
}

export function InputForm({ 
  label, 
  placeholder, 
  value, 
  type, 
  large, 
  onChange,
  darkMode = false
}: InputFormProps) {
  const containerClasses = darkMode 
    ? "text-indigo-100" 
    : "text-gray-900";
    
  const labelClasses = darkMode 
    ? "text-indigo-300" 
    : "text-zinc-600";
    
  const inputClasses = darkMode 
    ? "bg-gradient-to-r from-indigo-800/50 to-purple-800/50 border-indigo-500/50 placeholder:text-indigo-400 text-indigo-100 focus:ring-[4px] focus:ring-indigo-500/30" 
    : "bg-white border-zinc-300 placeholder:text-zinc-500 text-zinc-900 focus:ring-[4px] focus:ring-zinc-400/15";

  return (
    <div className={`flex flex-col gap-1.5 ${containerClasses}`}>
      <label className={`font-medium text-sm ${labelClasses}`}>
        {label}
      </label>
      
      {large ? (
        <textarea
          className={`py-2 px-3 border rounded-lg shadow-xs focus:outline-none h-24 align-text-top ${inputClasses}`}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
        />
      ) : (
        <input
          className={`py-2 px-3 border rounded-lg shadow-xs focus:outline-none ${inputClasses}`}
          type={type}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
        />
      )}
    </div>
  );
}