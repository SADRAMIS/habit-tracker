import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// === Загрузка и кеширование шрифтов ===
let fontsLoaded = false;
let robotoRegularBase64 = null;
let robotoBoldBase64 = null;

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function loadFonts() {
  if (fontsLoaded) return;

  const [regularRes, boldRes] = await Promise.all([
    fetch('/fonts/Roboto-Regular.ttf'),
    fetch('/fonts/Roboto-Bold.ttf'),
  ]);

  if (!regularRes.ok || !boldRes.ok) {
    throw new Error('Не удалось загрузить шрифты для PDF. Проверь, что файлы лежат в frontend/public/fonts/');
  }

  const [regularBuf, boldBuf] = await Promise.all([
    regularRes.arrayBuffer(),
    boldRes.arrayBuffer(),
  ]);

  robotoRegularBase64 = arrayBufferToBase64(regularBuf);
  robotoBoldBase64 = arrayBufferToBase64(boldBuf);
  fontsLoaded = true;
}

/**
 * Генерирует PDF-отчёт по списку целей.
 */
export async function generateGoalsPDF(goals, t, lang = 'ru') {
  // 1. Загружаем шрифты
  await loadFonts();

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 2. Регистрируем шрифты в jsPDF
  doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

  doc.addFileToVFS('Roboto-Bold.ttf', robotoBoldBase64);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

  doc.setFont('Roboto', 'normal');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === Заголовок ===
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('Roboto', 'bold');
  doc.text(t('export_pdf_title'), 14, 16);

  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  const now = new Date().toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
  doc.text(`${t('export_pdf_generated')}: ${now}`, 14, 22);

  // === Статистика ===
  const total = goals.length;
  const completed = goals.filter((g) => g.status === 'COMPLETED').length;
  const inProgress = goals.filter((g) => g.status === 'IN_PROGRESS').length;
  const expired = goals.filter((g) => g.status === 'EXPIRED').length;

  const totalProgress = goals.reduce((acc, g) => {
    const current = g.currentValue || 0;
    const target = g.targetValue || 1;
    return acc + Math.min(current / target, 1);
  }, 0);
  const overallPercent = total > 0 ? Math.round((totalProgress / total) * 100) : 0;

  let y = 35;
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  doc.setFont('Roboto', 'bold');
  doc.text(t('statistics'), 14, y);
  y += 8;

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(10);
  doc.text(`${t('export_pdf_total_goals')}: ${total}`, 14, y);
  doc.text(`${t('export_pdf_completed')}: ${completed}`, 70, y);
  doc.text(`${t('export_pdf_in_progress')}: ${inProgress}`, 130, y);
  y += 6;
  doc.text(`${t('export_pdf_expired')}: ${expired}`, 14, y);
  doc.text(`${t('export_pdf_overall')}: ${overallPercent}%`, 70, y);
  y += 10;

  // === Полоса общего прогресса ===
  doc.setFillColor(229, 231, 235);
  doc.roundedRect(14, y, pageWidth - 28, 6, 3, 3, 'F');
  if (overallPercent > 0) {
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(14, y, ((pageWidth - 28) * overallPercent) / 100, 6, 3, 3, 'F');
  }
  y += 14;

  // === Таблица целей ===
  const tableData = goals.map((goal, index) => {
    const current = goal.currentValue || 0;
    const target = goal.targetValue || 1;
    const percent = Math.round(Math.min((current / target) * 100, 100));

    let statusLabel = goal.status;
    if (goal.status === 'COMPLETED') statusLabel = `✓ ${t('completed')}`;
    if (goal.status === 'IN_PROGRESS') statusLabel = `⏳ ${t('in_progress')}`;
    if (goal.status === 'EXPIRED') statusLabel = `✗ ${t('expired')}`;

    return [
      index + 1,
      goal.title,
      statusLabel,
      `${current} / ${target} (${percent}%)`,
      new Date(goal.deadline).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US'),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [[
      '#',
      t('title'),
      t('statistics'),
      t('progress'),
      t('deadline'),
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'Roboto',          // ⚡ ключевой момент — используем Roboto для всей таблицы
      fontSize: 9,
      textColor: [31, 41, 55],
    },
    headStyles: {
      font: 'Roboto',
      fontStyle: 'bold',
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      halign: 'left',
    },
    bodyStyles: {
      font: 'Roboto',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 32 },
      3: { cellWidth: 32 },
      4: { cellWidth: 28 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const text = data.cell.raw || '';
        if (text.includes('✓')) data.cell.styles.textColor = [16, 185, 129];
        else if (text.includes('⏳')) data.cell.styles.textColor = [245, 158, 11];
        else if (text.includes('✗')) data.cell.styles.textColor = [239, 68, 68];
      }
    },
    // Применяем Roboto и к header/footer autoTable
    didDrawPage: () => {
      doc.setFont('Roboto', 'normal');
    },
  });

  // === Футер на каждой странице ===
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Habit Tracker — ${t('export_pdf_page')} ${i} / ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // === Скачивание ===
  const date = new Date().toISOString().slice(0, 10);
  doc.save(`goals_report_${date}.pdf`);
}