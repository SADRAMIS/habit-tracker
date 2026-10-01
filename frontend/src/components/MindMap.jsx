export default function MindMap({ topic, content }) {
  // Разбиваем content на «лучи»
  const rays = (content || '')
    .split(/[.;\n•·]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)
    .slice(0, 8);

  const total = rays.length || 1;
  const radius = 130;

  return (
    <div className="relative w-full h-[340px] flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full" viewBox="-200 -170 400 340" preserveAspectRatio="xMidYMid meet">
        {rays.map((_, i) => {
          const angle = (2 * Math.PI * i) / total - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <line
              key={i}
              x1="0" y1="0"
              x2={x} y2={y}
              stroke="#93c5fd"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          );
        })}
      </svg>

      {/* Центр */}
      <div className="relative z-10 max-w-[140px] px-4 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-center font-bold rounded-2xl shadow-lg">
        {topic}
      </div>

      {/* Лучи */}
      {rays.map((ray, i) => {
        const angle = (2 * Math.PI * i) / total - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <div
            key={i}
            className="absolute z-10 max-w-[120px] px-3 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-xl shadow-md text-xs text-gray-800 dark:text-gray-200"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {ray}
          </div>
        );
      })}
    </div>
  );
}