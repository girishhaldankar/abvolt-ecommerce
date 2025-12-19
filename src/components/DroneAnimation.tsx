export function DroneAnimation() {
  return (
    <div className="relative w-[280px] h-[280px] mx-auto select-none">

      <style>
        {`
        /* Floating animation */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }

        /* Rotor spin */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .rotor-blade { 
          transform-origin: center;
          animation: spin .2s linear infinite;
        }

        /* Droplet falling */
        @keyframes dropletFall {
          0% { opacity: 0; transform: translateY(0px) scale(0.6); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(40px) scale(1); }
        }
        .droplet {
          animation: dropletFall 0.7s linear infinite;
        }
        .droplet:nth-child(2) { animation-delay: .15s; }
        .droplet:nth-child(3) { animation-delay: .3s; }
        .droplet:nth-child(4) { animation-delay: .45s; }
        .droplet:nth-child(5) { animation-delay: .6s; }
        `}
      </style>

      <svg
        viewBox="0 0 300 300"
        className="w-full h-full animate-float"
      >

        {/* Field */}
        <rect
          x="60"
          y="200"
          width="180"
          height="55"
          rx="12"
          fill="#6ACB4F"
          stroke="#5AB441"
          strokeWidth="3"
        />

        {/* Drone Shadow */}
        <ellipse cx="150" cy="165" rx="55" ry="12" fill="rgba(0,0,0,0.18)" />

        {/* ---- REALISTIC DROPLETS ---- */}
        <g>
          {[1,2,3,4,5].map((d,i) => (
            <circle
              key={i}
              className="droplet"
              cx={150 + (Math.random() * 12 - 6)}
              cy="150"
              r={Math.random() * 3 + 2}
              fill="#4CD4FF"
            />
          ))}
        </g>

        {/* ---- DRONE ---- */}

        {/* Arms */}
        <line x1="150" y1="120" x2="80" y2="80" stroke="#d0d0d0" strokeWidth="12" />
        <line x1="150" y1="120" x2="220" y2="80" stroke="#d0d0d0" strokeWidth="12" />

        <line x1="150" y1="135" x2="95" y2="170" stroke="#d0d0d0" strokeWidth="12" />
        <line x1="150" y1="135" x2="205" y2="170" stroke="#d0d0d0" strokeWidth="12" />

        {/* Drone Body */}
        <ellipse cx="150" cy="125" rx="48" ry="25" fill="#ffffff" />
        <ellipse cx="150" cy="125" rx="48" ry="25" fill="#cfcfcf" opacity="0.4" />

        {/* Center Cap */}
        <circle cx="150" cy="125" r="10" fill="#4CD4FF" />

        {/* Propeller Bases */}
        {[ [80,80], [220,80], [95,170], [205,170] ].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r="16" fill="#fff" stroke="#bbb" strokeWidth="3" />
        ))}

        {/* ROTOR BLADES */}
        {[ [80,80], [220,80], [95,170], [205,170] ].map(([cx,cy],i)=>(
          <g key={i} className="rotor-blade">
            <rect x={cx-22} y={cy-3} width="44" height="6" rx="3" fill="#4CD4FF" />
          </g>
        ))}

      </svg>
    </div>
  );
}
