'use client';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 999,
  size = 'md',
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const sizeStyles = {
    sm: {
      button: 'w-8 h-8 text-sm',
      input: 'w-12 h-8 text-sm',
    },
    md: {
      button: 'w-10 h-10 text-base',
      input: 'w-16 h-10 text-base',
    },
    lg: {
      button: 'w-12 h-12 text-lg',
      input: 'w-20 h-12 text-lg',
    },
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={value <= min}
        className={`${sizeStyles[size].button} rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value) || min;
          if (newValue >= min && newValue <= max) {
            onChange(newValue);
          }
        }}
        className={`${sizeStyles[size].input} text-center font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
        min={min}
        max={max}
      />
      <button
        type="button"
        onClick={handleIncrease}
        disabled={value >= max}
        className={`${sizeStyles[size].button} rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        +
      </button>
    </div>
  );
}