import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { api } from '../api';

const locales = {
  ru: ru,
  en: enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getGoals();
        setGoals(data);
      } catch (error) {
        console.error('Ошибка загрузки целей:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Преобразуем цели в события календаря
  const events = goals.map((goal) => {
    const deadline = new Date(goal.deadline);
    return {
      id: goal.id,
      title: `${goal.status === 'COMPLETED' ? '✅' : goal.status === 'EXPIRED' ? '❌' : '⏳'} ${goal.title}`,
      start: deadline,
      end: deadline,
      allDay: true,
      resource: goal,
    };
  });

  // Цвет события в зависимости от статуса
  const eventPropGetter = (event) => {
    const status = event.resource.status;
    let backgroundColor = '#3b82f6'; // blue
    if (status === 'COMPLETED') backgroundColor = '#10b981'; // green
    if (status === 'EXPIRED') backgroundColor = '#ef4444'; // red
    if (status === 'IN_PROGRESS') {
      const daysLeft = Math.round((new Date(event.start) - new Date()) / (1000 * 60 * 60 * 24));
      backgroundColor = daysLeft <= 3 && daysLeft >= 0 ? '#f59e0b' : '#6366f1'; // orange if soon, indigo otherwise
    }
    return {
      style: {
        backgroundColor,
        border: 'none',
        borderRadius: '6px',
        color: '#fff',
        fontSize: '0.85rem',
        fontWeight: 500,
        padding: '2px 6px',
      },
    };
  };

  // Клик по событию — переход на страницу деталей цели
  const handleSelectEvent = (event) => {
    navigate(`/goals/${event.id}`);
  };

  // Клик по пустой дате — можно было бы создать цель, пока просто игнорируем
  const handleSelectSlot = () => {
    // опционально: можно открыть форму создания цели с этой датой
  };

  // Локализация сообщений react-big-calendar
  const messages = {
    today: t('calendar_today'),
    previous: '‹',
    next: '›',
    month: t('calendar_month'),
    week: t('calendar_week'),
    day: t('calendar_day'),
    agenda: t('calendar_agenda'),
    date: t('calendar_date'),
    time: t('calendar_time'),
    event: t('calendar_event'),
    allDay: t('calendar_all_day'),
    noEventsInRange: t('calendar_no_events'),
    showMore: (total) => `+${total}`,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            📅 {t('calendar')}
          </h1>
          <button
            onClick={() => navigate('/goals')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {t('back_to_goals')}
          </button>
        </div>

        {/* Легенда */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 flex flex-wrap gap-4 text-sm transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
            <span className="text-gray-700 dark:text-gray-300">{t('completed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6366f1' }}></span>
            <span className="text-gray-700 dark:text-gray-300">{t('in_progress')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></span>
            <span className="text-gray-700 dark:text-gray-300">⏰ {t('deadline_soon')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></span>
            <span className="text-gray-700 dark:text-gray-300">{t('expired')}</span>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">Loading...</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition-colors" style={{ minHeight: 600 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventPropGetter}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              messages={messages}
              culture={i18n.language}
              style={{ height: 600 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}