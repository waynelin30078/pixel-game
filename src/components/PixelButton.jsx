/**
 * 可重用像素風按鈕
 * variant: 'gold' | 'red' | 'ghost'
 */
export default function PixelButton({ children, onClick, variant = 'gold', disabled = false, style = {} }) {
  return (
    <button
      className={`btn-pixel btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
