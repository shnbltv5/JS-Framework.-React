export default function CoinIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="coin-icon">
      <circle cx="12" cy="12" r="10" fill="#FFD54F" stroke="#4B2E4F" strokeWidth="2" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#F0A92E" strokeWidth="1.6" />
      <path d="M9.2 10.4 L10 7.6 L11.6 9.4 h0.8 L14 7.6 L14.8 10.4 Q15.4 14.2 12 14.6 Q8.6 14.2 9.2 10.4Z" fill="#F0A92E" />
    </svg>
  );
}
