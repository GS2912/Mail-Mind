export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {/* Envelope + Brain Icon */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-smooth"
        >
          {/* Envelope body (pink) */}
          <path
            d="M4 8L16 16L28 8V24H4V8Z"
            fill="#d53158"
            stroke="#d53158"
            strokeWidth="1.5"
          />
          {/* Envelope flap (orange) */}
          <path
            d="M4 8L16 16L28 8"
            fill="#fa992b"
            stroke="#fa992b"
            strokeWidth="1.5"
          />
          {/* Brain (teal) */}
          <path
            d="M12 12C12 11 13 10 14 10C15 10 16 11 16 12C16 13 17 14 18 14C19 14 20 13 20 12C20 11 21 10 22 10C23 10 24 11 24 12C24 13 23 14 22 14C21 14 20 15 20 16C20 17 19 18 18 18C17 18 16 17 16 16C16 15 15 14 14 14C13 14 12 13 12 12Z"
            fill="#04b7b0"
            stroke="#04b7b0"
            strokeWidth="1"
          />
          <path
            d="M14 12C14 12.5 14.5 13 15 13C15.5 13 16 12.5 16 12"
            stroke="#191d2b"
            strokeWidth="0.5"
          />
          <path
            d="M18 12C18 12.5 18.5 13 19 13C19.5 13 20 12.5 20 12"
            stroke="#191d2b"
            strokeWidth="0.5"
          />
        </svg>
      </div>
      <span className="text-xl font-semibold">
        <span className="text-mailmind-orange">Mail</span>
        <span className="text-mailmind-pink">Mind</span>
      </span>
    </div>
  );
}

