import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { showToast } from './Toast';

const GENRES = ['Программирование', 'Художественная', 'Нон-фикшн', 'Психология', 'Бизнес'];
const STATUS_COLORS = {
  WANT_TO_READ: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  READING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export default function BooksPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Форма
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [totalPages, setTotalPages] = useState('');

  // Фильтр
  const [filter, setFilter] = useState('ALL');

  const loadBooks = async () => {
    try {
      const data = await api.getBooks();
      setBooks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createBook({ title, author, genre, totalPages: parseInt(totalPages) || 0 });
      setTitle('');
      setAuthor('');
      setTotalPages('');
      setShowForm(false);
      await loadBooks();
      showToast('Книга добавлена!', 'success');
    } catch (err) {
      showToast('Ошибка: ' + err.message, 'error');
    }
  };

  const handleUpdateProgress = async (id, currentPage) => {
    try {
      await api.updateBookProgress(id, parseInt(currentPage));
      await loadBooks();
    } catch (err) {
      showToast('Ошибка обновления: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту книгу?')) return;
    try {
      await api.deleteBook(id);
      await loadBooks();
      showToast('Удалено', 'success');
    } catch (err) {
      showToast('Ошибка: ' + err.message, 'error');
    }
  };

  const filteredBooks = filter === 'ALL' ? books : books.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📚 Моя библиотека</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition">
              {showForm ? '✕ Отмена' : '＋ Добавить книгу'}
            </button>
            <button onClick={() => navigate('/goals')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
              ← Назад
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Название книги" value={title} onChange={(e) => setTitle(e.target.value)} required className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
              <input placeholder="Автор" value={author} onChange={(e) => setAuthor(e.target.value)} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white">
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input placeholder="Всего страниц" type="number" value={totalPages} onChange={(e) => setTotalPages(e.target.value)} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <button type="submit" className="mt-4 w-full bg-blue-600 text-white font-bold py-2 rounded-lg">Сохранить</button>
          </form>
        )}

        {/* Фильтры */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['ALL', 'READING', 'COMPLETED', 'WANT_TO_READ'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {f === 'ALL' ? 'Все' : f === 'READING' ? 'Читаю' : f === 'COMPLETED' ? 'Прочитано' : 'Хочу прочитать'}
            </button>
          ))}
        </div>

        {/* Сетка книг */}
        {loading ? <p>Загрузка...</p> : filteredBooks.length === 0 ? <p className="text-center text-gray-500">Нет книг в этой категории.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map(book => {
              const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
              return (
                <div key={book.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-blue-500 relative flex flex-col transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white leading-tight">{book.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${STATUS_COLORS[book.status]}`}>
                      {book.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{book.author || 'Неизвестный автор'}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-4">{book.genre}</p>

                  <div className="mt-auto">
                    <div className="flex justify-between text-xs mb-1 text-gray-500">
                      <span>Прогресс</span>
                      <span>{book.currentPage} / {book.totalPages}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Стр."
                        defaultValue={book.currentPage}
                        onBlur={(e) => handleUpdateProgress(book.id, e.target.value)}
                        className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:text-white"
                      />
                      <button onClick={() => handleDelete(book.id)} className="text-red-500 hover:text-red-700 text-sm ml-auto">Удалить</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}