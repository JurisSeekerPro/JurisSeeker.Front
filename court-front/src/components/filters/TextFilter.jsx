// src/components/filters/TextFilter.jsx
import React from 'react';

export default function TextFilter({ 
  label, 
  value, 
  onChange, 
  placeholder,
  type = "text"
}) {
  return (
    <div className="mb-md">
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}