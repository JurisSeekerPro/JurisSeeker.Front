// src/components/filters/SelectFilter.jsx
import React from 'react';

export default function SelectFilter({ 
  label, 
  value, 
  onChange, 
  options,
  multiple = false 
}) {
  return (
    <div className="mb-md">
      <label className="label">{label}</label>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(multiple ? Array.from(e.target.selectedOptions, option => option.value) : e.target.value)}
        multiple={multiple}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}