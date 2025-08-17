import React from 'react';

const Input = ({ label, value, onChange, type = 'text' }) => (
    <div className="form-group">
        <label>{label}</label>
        <input type={type} value={value} onChange={onChange} />
    </div>
);

export default Input;