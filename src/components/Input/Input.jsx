import React from 'react';
import './Input.css';

const Input = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  error = '',
  mask = ''
}) => {
  const handleChange = (e) => {
    let inputValue = e.target.value;
    
    // Aplicar máscara se fornecida
    if (mask && type !== 'date' && type !== 'select') {
      inputValue = applyMask(inputValue, mask);
    }
    
    // Criar evento personalizado para manter compatibilidade
    const event = {
      target: {
        name,
        value: inputValue
      }
    };
    
    onChange(event);
  };

  const applyMask = (value, maskPattern) => {
    const cleanValue = value.replace(/\D/g, '');
    let maskedValue = '';
    let valueIndex = 0;
    
    for (let i = 0; i < maskPattern.length && valueIndex < cleanValue.length; i++) {
      if (maskPattern[i] === '9') {
        maskedValue += cleanValue[valueIndex];
        valueIndex++;
      } else {
        maskedValue += maskPattern[i];
      }
    }
    
    return maskedValue;
  };

  if (type === 'select') {
    return (
      <div className="input-group">
        <label className="input-label" htmlFor={name}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          className={`input-field ${error ? 'input-error' : ''}`}
        >
          <option value="">Selecione...</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="licenca">Licença</option>
          <option value="ferias">Férias</option>
        </select>
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }

  return (
    <div className="input-group">
      <label className="input-label" htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`input-field ${error ? 'input-error' : ''}`}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;