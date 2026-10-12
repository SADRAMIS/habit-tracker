import { useTranslation } from 'react-i18next';

/**
 * GitHub-style contribution heatmap.
 * Показывает последние N недель активности привычки.
 *
 * @param {Array<string>} dates - массив ISO-дат (YYYY-MM-DD), когда привычка была выполнена
 * @param {string} color - основной цвет привычки
 * @param {number} weeks - сколько недель показать (по умолчанию 20)
 */
export default function HabitHeatmap({ dates = [], color = '#10b981', weeks = 20 }) {
  const { t } = useTranslation();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Собираем даты в Set для быстрой проверки
  const dateSet = new Set(dates);

  // Считаем стартовую дату: понедельник на `weeks` недель назад
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks - 1) * 7);
  // Сдвигаем на начало недели (понедельник)
  const dayOfWeek = (start.getDay() + 6) % 7; // 0 = Пн, 6 = Вс
  start.setDate(start.getDate() - dayOfWeek);

  // Формируем сетку: массив столбцов (недель), в каждом — 7 дней
  const columns = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor);
      date.setDate(date.getDate() + d);
      const iso = date.toISOString().slice(0, 10);
      const isFuture = date > today;
      const done = dateSet.has(iso);

      week.push({
        iso,
        date: new Date(date),
        done,
        isFuture,
        isToday: date.getTime() === today.getTime(),
      });
    }
    columns.push(week);
    cursor.setDate(cursor.getDate() + 7);
  }

  // Названия месяцев над колонками
  const monthLabels = [];
  let lastMonth = -1;
  columns.forEach((week, i) => {
    const firstDay = week[0].date;
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ index: i, label: firstDay.toLocaleString('default', { month: 'short' }) });
      lastMonth = month;
    }
  });

  const dayLabels = ['Пн', '', 'Ср', '', 'Пт', '', 'Вс'];

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex ml-7 mb-1 text-xs text-gray-500 dark:text-gray-400">
          {columns.map((_, i) => {
            const label = monthLabels.find((m) => m.index === i);
            return (
              <div key={i} className="w-3 flex-shrink-0">
                {label && <span className="whitespace-nowrap">{label.label}</span>}
              </div>
            );
          })}
        </div>

        <div className="flex">
          {/* Day-of-week labels */}
          <div className="flex flex-col justify-between mr-1 text-[10px] text-gray-400 dark:text-gray-500 h-[88px]">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-3 leading-3">
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {columns.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day.iso}
                    title={`${day.iso}${day.done ? ' ✅' : ''}`}
                    className={`w-3 h-3 rounded-sm transition-colors ${
                      day.isFuture
                        ? 'bg-transparent'
                        : day.done
                        ? ''
                        : 'bg-gray-200 dark:bg-gray-700'
                    } ${day.isToday ? 'ring-2 ring-offset-1 ring-blue-400 dark:ring-offset-gray-800' : ''}`}
                    style={{
                      backgroundColor: day.done ? color : undefined,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-7 text-xs text-gray-500 dark:text-gray-400">
          <span>Меньше</span>
          <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="w-3 h-3 rounded-sm opacity-40" style={{ backgroundColor: color }} />
          <div className="w-3 h-3 rounded-sm opacity-70" style={{ backgroundColor: color }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
}