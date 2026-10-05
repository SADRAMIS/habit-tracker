package com.sadramis.habit_tracker.config;

import com.sadramis.habit_tracker.model.StudyTopic;
import com.sadramis.habit_tracker.repository.StudyTopicRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StudyTopicSeeder implements CommandLineRunner {

    private final StudyTopicRepository repo;

    public StudyTopicSeeder(StudyTopicRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;

        seedModule1();

    }

    private void seedModule1() {
        add(
                "Модуль 1. Java Collections & JMM",
                "HashMap (Java 8+)",
                "Внутреннее устройство HashMap: buckets, treeify, resize, hash spread.",
                "HashMap — это массив бакетов (Node<K,V>[] table).\n" +
                        "Индексация: (n-1) & hash, где n — длина массива (степень двойки).\n" +
                        "Коллизии разрешаются цепочкой (linked list).\n\n" +
                        "Java 8+ добавила treeify: если в бакете > 8 элементов И table.length >= 64,\n" +
                        "цепочка превращается в красно-чёрное дерево (TreeNode).\n" +
                        "Если элементов становится < 6 — обратно в linked list (untreeify).\n\n" +
                        "Resize: при size > capacity * loadFactor (0.75), capacity удваивается,\n" +
                        "все элементы перераспределяются. С Java 8 перераспределение оптимизировано:\n" +
                        "элемент остаётся на месте ИЛИ переезжает на index + oldCapacity.\n\n" +
                        "Spread-функция: hash = h ^ (h >>> 16). Это «размазывает» старшие биты\n" +
                        "в младшие, чтобы они участвовали в (n-1) & hash.",
                "🏰 ДВОРЕЦ ПАМЯТИ: Почтовое отделение\n\n" +
                        "┌─────────────────────────────────────┐\n" +
                        "│  Стена с почтовыми ящиками (table)  │\n" +
                        "│  [0]   [1]   [2]   [3]   ...  [15]  │\n" +
                        "│   │     │     │     │               │\n" +
                        "│   ▼     ▼     ▼     ▼               │\n" +
                        "│  box   box   box   box              │\n" +
                        "└─────────────────────────────────────┘\n\n" +
                        "1) Каждое письмо (Entry) имеет адрес (hash).\n" +
                        "   Адрес → номер ящика = (n-1) & hash.\n\n" +
                        "2) Ящик переполнен → письма связывают верёвочкой (linked list).\n\n" +
                        "3) В ящике больше 8 писем — приходит садовник и заменяет\n" +
                        "   верёвочку на дерево 🌳 (treeify). Растёт ёлочка из TreeNode.\n\n" +
                        "4) Ящиков не хватает (size > 0.75 * capacity) — стена\n" +
                        "   удваивается до 32, потом до 64. Письма переезжают: либо\n" +
                        "   остаются в старом ящике, либо уезжают в новый (index + 16).\n\n" +
                        "5) Малыш-хэшкод (h) сначала проходит через центрифугу:\n" +
                        "   h ^ (h >>> 16) — это чтобы старшие биты не спали.",
                "🧠 Факт №1: HashMap допускает ОДИН null-ключ (лежит в бакете 0) и много null-значений.\n---\n" +
                        "🧠 Факт №2: initial capacity задавай степенью двойки (16, 32, 64) — иначе будет лишний resize.\n---\n" +
                        "🧠 Факт №3: до Java 8 вставка в голову цепочки приводила к циклу при параллельном resize. В Java 8 вставляют в хвост.\n---\n" +
                        "🧠 Факт №4: HashMap НЕ потокобезопасна. Для многопоточки — ConcurrentHashMap.\n---\n" +
                        "🧠 Факт №5: loadFactor=0.75 — компромисс между скоростью и памятью (по умолчанию).",
                "java,collections,hashmap",
                1
        );

        add(
                "Модуль 1. Java Collections & JMM",
                "ConcurrentHashMap",
                "ConcurrentHashMap в Java 8+: lock striping, CAS, treeify.",
                "ConcurrentHashMap (Java 8+) использует:\n" +
                        "- CAS для пустых бакетов (без блокировки)\n" +
                        "- synchronized на голове бакета (lock striping на уровне бакета)\n" +
                        "- treeify при > 8 элементах в бакете (как HashMap)\n" +
                        "- size() приблизительный через CounterCell (LongAdder-стиль)\n\n" +
                        "Не блокирует всю таблицу — только конкретный бакет.\n" +
                        "Не допускает null-ключ и null-значение (важно для атомарных операций).\n\n" +
                        "Ключевые методы: putIfAbsent, computeIfAbsent, merge, replace.",
                "🏰 ДВОРЕЦ ПАМЯТИ: Банк с окошками\n\n" +
                        "Обычный HashMap — один кассир на весь банк 🐢\n" +
                        "ConcurrentHashMap — окошки-бакеты, у каждого свой кассир 💪\n\n" +
                        "1) Пустое окошко → кассир кладёт документ через CAS (мгновенно, без замка).\n" +
                        "2) Занятое окошко → берёт ключ именно от ЭТОГО окошка.\n" +
                        "3) Ключей стало много → нанимают дерево-помощника 🌳\n" +
                        "4) size() считают несколько счётчиков (CounterCell), потом суммируют.",
                "🧠 Факт №1: ConcurrentHashMap НЕ допускает null-ключ (в отличие от HashMap) — чтобы не путать «нет ключа» и «ключ = null».\n---\n" +
                        "🧠 Факт №2: в Java 7 был Segment (16 сегментов), в Java 8 — бакет-level locking.\n---\n" +
                        "🧠 Факт №3: computeIfAbsent — атомарная операция «получить или создать».",
                "java,collections,concurrency",
                2
        );

        add(
                "Модуль 1. Java Collections & JMM",
                "synchronized, volatile, wait/notify",
                "Базовые примитивы синхронизации и Java Memory Model.",
                "synchronized:\n" +
                        "- Гарантирует mutual exclusion + visibility (happens-before).\n" +
                        "- Блокировка на объекте (this, Class или любом Object).\n" +
                        "- Может блокировать надолго → плохо для throughput.\n\n" +
                        "volatile:\n" +
                        "- Гарантирует ТОЛЬКО visibility и запрет reordering.\n" +
                        "- НЕ даёт атомарности (i++ всё ещё гонка).\n" +
                        "- Работает через memory barrier (StoreLoad на x86).\n\n" +
                        "wait/notify/notifyAll:\n" +
                        "- Должны вызываться внутри synchronized блока на том же объекте.\n" +
                        "- wait() освобождает монитор и ждёт сигнала.\n" +
                        "- Всегда используй wait() в while-loop, а не if — чтобы отсеять spurious wakeups.\n\n" +
                        "Spurious wakeup: поток может проснуться без notify() — это разрешено JVM.",
                "🏰 ДВОРЕЦ ПАМЯТИ: Комната с одной дверью\n\n" +
                        "1) synchronized — дверь с ключом. Один поток вошёл — другие ждут на улице.\n" +
                        "2) volatile — стеклянная стена. Все видят изменения, но войти могут все сразу.\n" +
                        "3) wait() — поток вешает табличку «Сплю, разбудите» и выходит из комнаты.\n" +
                        "4) notify() — будильник для ОДНОГО спящего (случайного).\n" +
                        "5) notifyAll() — будильник для ВСЕХ спящих.\n\n" +
                        "⚠ Ловушка spurious wakeup: ты можешь проснуться, даже если никто не звонил.\n" +
                        "Поэтому проверяй условие в while:\n" +
                        "  synchronized(lock) { while(!ready) lock.wait(); }",
                "🧠 Факт №1: wait() вне synchronized → IllegalMonitorStateException.\n---\n" +
                        "🧠 Факт №2: volatile int x; x++ НЕ атомарен — три операции: read, inc, write.\n---\n" +
                        "🧠 Факт №3: для атомарного инкремента — AtomicInteger или LongAdder.",
                "java,concurrency,jmm",
                3
        );


    }

    private void add(String module, String title, String summary,
                     String content, String visualization, String facts,
                     String tags, int order) {
        StudyTopic t = new StudyTopic();
        t.setModule(module);
        t.setTitle(title);
        t.setSummary(summary);
        t.setContent(content);
        t.setVisualization(visualization);
        t.setFacts(facts);
        t.setTags(tags);
        t.setOrderIndex(order);
        repo.save(t);
    }
}