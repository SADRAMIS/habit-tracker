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
        seedModule2();
        seedModule3();
        seedModule4();
        seedModule5();
        seedModule6();
        seedModule7();
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
    private void seedModule2() {
        add(
                "Модуль 2. Kafka & Event-Driven",
                "Топики и партиции",
                "Topic — логическая сущность, Partition — физический журнал append-only.",
                "Topic — это именованный поток сообщений.\n" +
                        "Внутри топика — N партиций (partition).\n\n" +
                        "Партиция = append-only log. Каждое сообщение имеет offset (порядковый номер).\n" +
                        "Порядок гарантирован ТОЛЬКО внутри партиции, не между ними.\n\n" +
                        "Ключ сообщения → hash → номер партиции:\n" +
                        "  partition = hash(key) % partitions\n\n" +
                        "Если key = null — round robin / sticky partitioning (в новых версиях).\n\n" +
                        "Replication factor: каждая партиция копируется на N брокеров. Один — leader, остальные — followers.",
                "🏰 ДВОРЕЦ ПАМЯТИ: Железнодорожный вокзал\n\n" +
                        "Topic = расписание поездов (маршрутов)\n" +
                        "Partition = отдельная колея\n" +
                        "Message = вагон с грузом\n" +
                        "Offset = номер вагона на этой колее\n\n" +
                        "🚂 Колея 0: [0] [1] [2] [3] ... (строго по порядку)\n" +
                        "🚂 Колея 1: [0] [1] [2] ...\n" +
                        "🚂 Колея 2: [0] [1] ...\n\n" +
                        "Ключ = способ выбрать колею: hash(key) % 3\n\n" +
                        "Replication: каждую колею дублируют в 3 депо. Один — главный, два — резерв.",
                "🧠 Факт №1: offset не сбрасывается, если retention не истёк. Читать можно повторно.\n---\n" +
                        "🧠 Факт №2: количество партиций нельзя уменьшить — только увеличить (но сломает hash-порядок для ключей).\n---\n" +
                        "🧠 Факт №3: leader может переехать на другой брокер при падении — это rebalance.",
                "kafka,event-driven",
                1
        );

        add(
                "Модуль 2. Kafka & Event-Driven",
                "Consumer Groups и гарантии доставки",
                "at-least-once, at-most-once, exactly-once, идемпотентный Consumer.",
                "Consumer Group — группа консьюмеров, которые делят между собой партиции.\n" +
                        "Одна партиция → один консьюмер внутри группы (для параллелизма).\n" +
                        "Если консьюмеров больше, чем партиций — лишние простаивают.\n\n" +
                        "Гарантии доставки:\n" +
                        "- at-most-once: коммит ДО обработки → при падении сообщение потеряется.\n" +
                        "- at-least-once: коммит ПОСЛЕ обработки → при падении сообщение придёт повторно (duplicate!).\n" +
                        "- exactly-once: транзакции + идемпотентный producer. Достигается в Kafka Streams, но дорого.\n\n" +
                        "Идемпотентный Consumer: обработка одного и того же сообщения дважды не меняет результат.\n" +
                        "Достигается через уникальный ключ (messageId) + проверку в БД.",
                "🏰 ДВОРЕЦ ПАМЯТИ: Бригада грузчиков на складе\n\n" +
                        "Consumer Group = бригада\n" +
                        "Партиция = отдельный конвейер\n" +
                        "Consumer = грузчик\n\n" +
                        "Правило: один грузчик — один конвейер.\n" +
                        "5 грузчиков, 3 конвейера → двое курят ☕\n\n" +
                        "At-most-once = грузчик ставит галочку «разгрузил» ДО того как разгрузит.\n" +
                        "  Упал — галочка есть, товара нет. ❌\n\n" +
                        "At-least-once = грузчик ставит галочку ПОСЛЕ разгрузки.\n" +
                        "  Упал — разгрузит снова (двойная работа!). 🔁\n\n" +
                        "Exactly-once = грузчик с волшебным сканером: если коробка уже в базе — не берёт. ✨",
                "🧠 Факт №1: параметр auto.offset.reset=earliest|latest — что делать, если нет закоммиченного offset.\n---\n" +
                        "🧠 Факт №2: enable.idempotence=true у Producer решает дубликаты, но не решает \"прочитал дважды\".\n---\n" +
                        "🧠 Факт №3: DLQ (Dead Letter Queue) — отдельный топик для сообщений, которые не удалось обработать.",
                "kafka,event-driven,delivery",
                2
        );
    }

    private void seedModule3() {
        add(
                "Модуль 3. Spring Boot Core & Web",
                "IoC, DI и жизненный цикл бина",
                "ApplicationContext, три вида DI, 8 станций жизненного цикла.",
                "IoC (Inversion of Control): контейнер сам создаёт объекты, а не вы через new.\n" +
                        "DI (Dependency Injection) — способ доставки зависимостей: constructor / setter / field.\n" +
                        "  Constructor — рекомендуется. Гарантирует неизменяемость и обязательность.\n" +
                        "  Setter — если зависимость опциональна.\n" +
                        "  Field (@Autowired на поле) — плохо тестируется, скрывает зависимости.\n\n" +
                        "Жизненный цикл бина — 8 станций:\n" +
                        "1) Инстанцирование (new)\n" +
                        "2) Population (@Autowired, @Value)\n" +
                        "3) Aware (BeanNameAware, BeanFactoryAware)\n" +
                        "4) BeanPostProcessor.postProcessBeforeInitialization()\n" +
                        "5) @PostConstruct → afterPropertiesSet() → custom init-method\n" +
                        "6) BeanPostProcessor.postProcessAfterInitialization() (здесь создаются AOP-прокси!)\n" +
                        "7) Бин готов к работе\n" +
                        "8) При закрытии: @PreDestroy → destroy() → custom destroy-method",
                "🏰 ДВОРЕЦ ПАМЯТИ: Конвейер на заводе\n\n" +
                        "Склад IoC → коробки-бины\n" +
                        "Курьеры DI → доставляют зависимости\n\n" +
                        "Конвейер (8 станций):\n" +
                        "  🏭 1. Рождение (new)\n" +
                        "  💉 2. Наполнение (@Autowired)\n" +
                        "  🏷 3. Осознание имени (Aware)\n" +
                        "  🧴 4. BPP before (мажут кремом)\n" +
                        "  ✨ 5. @PostConstruct + init\n" +
                        "  🎁 6. BPP after (оборачивают в прокси-плёнку)\n" +
                        "  📦 7. Готов к работе\n" +
                        "  🔥 8. @PreDestroy (печь утилизации)",
                "🧠 Факт №1: бин singleton создаётся один раз на весь ApplicationContext.\n---\n" +
                        "🧠 Факт №2: prototype-бин НЕ вызывает @PreDestroy при закрытии контекста.\n---\n" +
                        "🧠 Факт №3: AOP-прокси создаются на станции 6 (BPP after).",
                "spring,ioc,di",
                1
        );

        add(
                "Модуль 3. Spring Boot Core & Web",
                "@Transactional, прокси и self-invocation",
                "JDK vs CGLIB, ловушка self-invocation, @RestControllerAdvice.",
                "@Transactional работает через AOP-прокси:\n" +
                        "- JDK Dynamic Proxy: если бин реализует интерфейс. Прокси выглядит как интерфейс.\n" +
                        "- CGLIB: подкласс класса. Работает без интерфейса. В Spring Boot по умолчанию ВСЕГДА CGLIB.\n\n" +
                        "Ловушка self-invocation:\n" +
                        "  this.method() изнутри класса → прокси-обёртка НЕ перехватывает вызов.\n" +
                        "  @Transactional на внутреннем методе НЕ СРАБОТАЕТ.\n\n" +
                        "Решения:\n" +
                        "  1) Вынести метод в отдельный бин.\n" +
                        "  2) Получить self-прокси через AopContext.currentProxy().\n" +
                        "  3) Self-injection через @Autowired на самого себя.\n\n" +
                        "CGLIB не может проксировать: final-классы, final-методы, private-методы.",
                "🏰 ДВОРЕЦ ПАМЯТИ: Зеркальный зал\n\n" +
                        "Оборотни-прокси стоят СНАРУЖИ объекта.\n" +
                        "Вызов снаружи → прокси перехватывает → делает магию → делегирует.\n\n" +
                        "Self-invocation: объект стоит ВНУТРИ комнаты, стучит по стене (this.call()).\n" +
                        "Оборотень снаружи глухой — он слышит только вызовы снаружи.\n\n" +
                        "  ❌ [caller] → (proxy) → this.method() → this.otherMethod()\n" +
                        "                        ▲                    ▲\n" +
                        "                     перехват             НЕ перехват\n\n" +
                        "  ✅ [caller] → (proxy) → otherBean.method() (перехват)",
                "🧠 Факт №1: в Spring Boot 2+ proxyTargetClass=true по умолчанию → всегда CGLIB.\n---\n" +
                        "🧠 Факт №2: @Transactional работает только на public-методах.\n---\n" +
                        "🧠 Факт №3: @RestControllerAdvice + @ExceptionHandler — глобальный перехват исключений для всех контроллеров.",
                "spring,transaction,aop",
                2
        );
    }

    private void seedModule4() {
        add(
                "Модуль 4. SQL и Базы данных",
                "Порядок выполнения SQL и JOIN",
                "FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
                "Порядок выполнения SQL-запроса (не путать с порядком написания!):\n" +
                        "1) FROM + JOIN (собираем данные)\n" +
                        "2) WHERE (фильтр строк ДО группировки)\n" +
                        "3) GROUP BY (группировка)\n" +
                        "4) HAVING (фильтр групп ПОСЛЕ группировки)\n" +
                        "5) SELECT (выбор колонок + алиасы)\n" +
                        "6) DISTINCT (удаление дублей)\n" +
                        "7) ORDER BY (сортировка)\n" +
                        "8) LIMIT / OFFSET (пагинация)\n\n" +
                        "Типы JOIN:\n" +
                        "- INNER JOIN: только совпадающие строки.\n" +
                        "- LEFT JOIN: все из левой + совпадающие из правой (NULL если нет).\n" +
                        "- RIGHT JOIN: зеркально.\n" +
                        "- FULL OUTER JOIN: все из обеих.\n" +
                        "- CROSS JOIN: декартово произведение.\n\n" +
                        "WHERE vs HAVING:\n" +
                        "- WHERE фильтрует строки ДО агрегации (нельзя COUNT).\n" +
                        "- HAVING фильтрует результат агрегации (можно COUNT, SUM).",
                "🏰 ДВОРЕЦ ПАМЯТИ: Сборочный цех\n\n" +
                        "1. FROM / JOIN — привозят детали на склад 🚛\n" +
                        "2. WHERE — бракер отбраковывает поштучно ❌\n" +
                        "3. GROUP BY — сортируют по коробкам 📦\n" +
                        "4. HAVING — бракуют целые коробки (мало деталей) 🗑\n" +
                        "5. SELECT — наклеивают этикетки 🏷\n" +
                        "6. DISTINCT — убирают дубли ✂️\n" +
                        "7. ORDER BY — расставляют по алфавиту 📚\n" +
                        "8. LIMIT — берут первые N коробок 📤\n\n" +
                        "JOIN = сваривают две детали:\n" +
                        "INNER = только сваренные вместе 🔗\n" +
                        "LEFT  = все детали слева + приваренные справа",
                "🧠 Факт №1: WHERE выполняется ДО GROUP BY, поэтому в WHERE нельзя COUNT(*).\n---\n" +
                        "🧠 Факт №2: SELECT в порядке выполнения идёт ПОСЛЕ HAVING, поэтому алиасы из SELECT недоступны в WHERE.\n---\n" +
                        "🧠 Факт №3: LEFT JOIN + условие на правую таблицу в WHERE превращает его в INNER JOIN!",
                "sql,database",
                1
        );

        add(
                "Модуль 4. SQL и Базы данных",
                "ACID, уровни изоляции и MVCC",
                "Read Committed, Repeatable Read, MVCC в PostgreSQL, N+1.",
                "ACID:\n" +
                        "- Atomicity — транзакция либо вся, либо ничего.\n" +
                        "- Consistency — данные переходят из одного согласованного состояния в другое.\n" +
                        "- Isolation — параллельные транзакции не мешают друг другу.\n" +
                        "- Durability — после коммита данные сохранены (даже при падении).\n\n" +
                        "Уровни изоляции:\n" +
                        "- READ UNCOMMITTED — грязное чтение (в Postgres не поддерживается, работает как RC).\n" +
                        "- READ COMMITTED — дефолт в Postgres. Видны только закоммиченные данные.\n" +
                        "- REPEATABLE READ — снапшот на момент старта транзакции.\n" +
                        "- SERIALIZABLE — полная изоляция, транзакции эквивалентны последовательным.\n\n" +
                        "MVCC (Multi-Version Concurrency Control) в Postgres:\n" +
                        "- Каждая строка имеет xmin (создана) и xmax (удалена).\n" +
                        "- Читатели не блокируют писателей и наоборот.\n" +
                        "- UPDATE = INSERT новой версии + DELETE старой.\n\n" +
                        "Проблема N+1 в Hibernate:\n" +
                        "- 1 запрос на список + N запросов на связи.\n" +
                        "- Решение: JOIN FETCH, @EntityGraph, @BatchSize.",
                "🏰 ДВОРЕЦ ПАМЯТИ: Банковское хранилище\n\n" +
                        "A — атомарность: операция «перевод денег» либо прошла, либо нет 💰\n" +
                        "C — согласованность: сумма всех счетов не меняется\n" +
                        "I — изоляция: транзакции в отдельных капсулах 💊\n" +
                        "D — долговечность: запись в журнал, даже если свет вырубят 💾\n\n" +
                        "MVCC = библиотека с версиями книг:\n" +
                        "  Каждая строка = книга с пометкой «взята/сдана».\n" +
                        "  Читатель берёт свою версию — писатель не мешает.\n\n" +
                        "N+1 = курьер, который бегает за каждой книгой отдельно.\n" +
                        "JOIN FETCH = курьер привозит всё разом 🚚",
                "🧠 Факт №1: в Postgres READ UNCOMMITTED работает как READ COMMITTED — грязного чтения нет.\n---\n" +
                        "🧠 Факт №2: SERIALIZABLE может выбрасывать ошибку serialization_failure — приложение должно ретраить.\n---\n" +
                        "🧠 Факт №3: PostgreSQL не делает VACUUM — старые версии копятся и раздувают таблицу.",
                "sql,database,mvcc",
                2
        );
    }

    private void seedModule5() {
        add(
                "Модуль 5. Тестирование (JUnit 5, Mockito, Testcontainers)",
                "JUnit 5, Mockito и ArgumentCaptor",
                "@Test, @BeforeEach, mock vs spy, doReturn/when.",
                "JUnit 5 аннотации:\n" +
                        "- @Test, @BeforeEach, @AfterEach, @BeforeAll, @AfterAll\n" +
                        "- @ParameterizedTest + @ValueSource / @MethodSource\n" +
                        "- @DisplayName, @Disabled, @Nested\n\n" +
                        "Mockito:\n" +
                        "- mock(Class) — создаёт пустышку, все методы возвращают null/0.\n" +
                        "- spy(Object) — реальный объект, но можно переопределить методы.\n" +
                        "- when(...).thenReturn(...) — заглушка (только для mock).\n" +
                        "- doReturn(...).when(spy).method() — для spy (безопаснее).\n" +
                        "- doThrow(...).when(mock).voidMethod() — для void-методов.\n\n" +
                        "ArgumentCaptor — перехватывает аргументы, переданные в mock:\n" +
                        "  ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);\n" +
                        "  verify(repo).save(captor.capture());\n" +
                        "  assertEquals(\"test\", captor.getValue().getName());\n\n" +
                        "@SpringBootTest vs @WebMvcTest:\n" +
                        "- @SpringBootTest — поднимает весь контекст (медленно).\n" +
                        "- @WebMvcTest — только контроллер + MockMvc (быстро).\n" +
                        "- @DataJpaTest — только JPA + встроенная БД.\n\n" +
                        "Testcontainers — реальные Postgres/Kafka в Docker во время тестов.",
                "🏰 ДВОРЕЦ ПАМЯТИ: Театр с дублёрами\n\n" +
                        "mock = манекен, все методы возвращают null (пустышка) 🎭\n" +
                        "spy = настоящий актёр, но иногда играет дублёр 🎬\n\n" +
                        "when().thenReturn() = режиссёр даёт указания дублёру 🎤\n" +
                        "doReturn().when(spy) = актёр повторяет свою роль 🎭\n\n" +
                        "ArgumentCaptor = суфлёр подслушивает, что сказал актёр 📝\n\n" +
                        "@SpringBootTest = полный спектакль со всеми декорациями 🎪\n" +
                        "@WebMvcTest   = только один актёр на сцене 🎬\n" +
                        "@DataJpaTest  = репетиция только с реквизитом 🧰",
                "🧠 Факт №1: Mockito 5 требует agent или mockito-inline для final классов.\n---\n" +
                        "🧠 Факт №2: Testcontainers поднимает контейнер один раз на класс (static) → тесты быстрее.\n---\n" +
                        "🧠 Факт №3: @MockBean устарел в Spring Boot 3.4+, теперь @MockitoBean.",
                "testing,junit,mockito",
                1
        );
    }

    private void seedModule6() {
        add(
                "Модуль 6. Docker & Kubernetes",
                "Multi-stage build и лёгкие образы",
                "Как уменьшить образ Spring Boot с 700 МБ до 100 МБ.",
                "Multi-stage build:\n" +
                        "  # Stage 1 — сборка\n" +
                        "  FROM maven:3.9-eclipse-temurin-17 AS build\n" +
                        "  COPY pom.xml .\n" +
                        "  RUN mvn dependency:go-offline\n" +
                        "  COPY src ./src\n" +
                        "  RUN mvn package -DskipTests\n\n" +
                        "  # Stage 2 — рантайм\n" +
                        "  FROM eclipse-temurin:17-jre-alpine\n" +
                        "  COPY --from=build /app/target/app.jar app.jar\n" +
                        "  ENTRYPOINT [\"java\",\"-jar\",\"/app.jar\"]\n\n" +
                        "Почему это работает:\n" +
                        "- В финальный образ попадает только JRE, а не Maven+JDK.\n" +
                        "- Размер: 700 МБ → 100 МБ.\n\n" +
                        "Советы:\n" +
                        "- COPY pom.xml первым — кэш зависимостей.\n" +
                        "- .dockerignore — исключить target/, node_modules/.\n" +
                        "- Alpine-образ на ~30% меньше обычного.\n" +
                        "- Java 21+ → можно использовать CDS (Class Data Sharing).",
                "🏰 ДВОРЕЦ ПАМЯТИ: Завод с двумя цехами\n\n" +
                        "Цех №1 — большая мастерская (maven, jdk, исходники)\n" +
                        "  👷 Собирает готовое изделие (jar)\n" +
                        "  🚪 После сборки — закрывается навсегда\n\n" +
                        "Цех №2 — маленький магазин (jre, alpine)\n" +
                        "  📦 Получает ТОЛЬКО готовое изделие\n" +
                        "  🎁 Отдаёт клиентам — быстро и легко\n\n" +
                        "Итог: большой завод → маленький прилавок.\n" +
                        "700 МБ → 100 МБ.",
                "🧠 Факт №1: JRE (не JDK!) — только runtime, ~150 МБ экономии.\n---\n" +
                        "🧠 Факт №2: .dockerignore ускоряет сборку на 30-50%.\n---\n" +
                        "🧠 Факт №3: Docker layers кэшируются, если COPY-файлы не изменились.",
                "docker,k8s,devops",
                1
        );

        add(
                "Модуль 6. Docker & Kubernetes",
                "Pod, Deployment, Service, Probes",
                "Базовая архитектура Kubernetes.",
                "Pod — минимальная единица в K8s. Внутри 1+ контейнеров.\n" +
                        "  Контейнеры в Pod делят network namespace и volume.\n\n" +
                        "Deployment — управляет ReplicaSet (сколько Pod'ов держать).\n" +
                        "  Стратегии обновления: RollingUpdate (default), Recreate.\n\n" +
                        "Service — стабильная точка доступа к Pod'ам. Типы:\n" +
                        "  - ClusterIP (default) — только внутри кластера.\n" +
                        "  - NodePort — открывает порт на всех нодах (30000-32767).\n" +
                        "  - LoadBalancer — внешний LB от облака.\n" +
                        "  - ExternalName — DNS CNAME.\n\n" +
                        "Probes:\n" +
                        "  - livenessProbe — если упал, K8s перезапускает Pod.\n" +
                        "  - readinessProbe — если не готов, K8s убирает из Service.\n" +
                        "  - startupProbe — даёт Pod'у время на старт (для медленных приложений).\n\n" +
                        "ConfigMap — конфиги. Secret — секреты (base64, не шифр!).",
                "🏰 ДВОРЕЦ ПАМЯТИ: Многоэтажный офис\n\n" +
                        "Pod = комната с 1+ сотрудниками (контейнерами)\n" +
                        "      Все дышат одним воздухом (network) и пьют из кулера (volume)\n\n" +
                        "Deployment = начальник отдела\n" +
                        "      Следит, чтобы в отделе было всегда 5 сотрудников\n" +
                        "      Уволился — нанял нового (self-healing)\n\n" +
                        "Service = ресепшн на входе\n" +
                        "      Не знает номеров — но знает, что в отделе 5 человек\n" +
                        "      Распределяет посетителей по сотрудникам\n\n" +
                        "ClusterIP — только свои, по пропуску\n" +
                        "NodePort  — вход через главные двери здания\n" +
                        "LB        — внешний консьерж заказывает такси\n\n" +
                        "Probes = доктор:\n" +
                        "  liveness  — пульс есть? Нет — отправить в реанимацию 🔁\n" +
                        "  readiness — можно к нему зайти? Нет — табличка «занят» 📛",
                "🧠 Факт №1: Pod обычно эфемерен — Deployment может его убить и создать новый.\n---\n" +
                        "🧠 Факт №2: Service находит Pod'ы через label selector, а не по IP.\n---\n" +
                        "🧠 Факт №3: Secret хранит base64, не шифрует. Для шифрования — Vault или Sealed Secrets.",
                "docker,k8s,devops",
                2
        );
    }

    private void seedModule7() {
        add(
                "Модуль 7. Финальный Code Review",
                "Топ-10 антипаттернов в Spring",
                "Проверь свой проект на эти грабли.",
                "Антипаттерны, которые ищут на ревью:\n\n" +
                        "1) Field Injection (@Autowired на поле) — скрытые зависимости, плохо тестируется.\n" +
                        "2) N+1 запросы в JPA — не использовать @EntityGraph/JOIN FETCH.\n" +
                        "3) @Transactional на private методе — не работает, прокси не перехватит.\n" +
                        "4) Self-invocation — вызов this.method() внутри класса с @Transactional.\n" +
                        "5) Логирование через System.out.println вместо логгера.\n" +
                        "6) try-catch, который глотает исключения без логирования.\n" +
                        "7) Отсутствие @Valid на DTO — валидация в контроллере вручную.\n" +
                        "8) Секреты в application.yml вместо ENV-переменных.\n" +
                        "9) Открытый actuator со всеми эндпоинтами в продакшене.\n" +
                        "10) SELECT * через findAll() на большом объёме — нужна пагинация (Pageable).\n\n" +
                        "11) Гонка в ConcurrentHashMap: check-then-act без computeIfAbsent.\n" +
                        "12) @Async метод, вызываемый изнутри того же класса — не сработает.\n" +
                        "13) Смешивание бизнес-логики в контроллере.\n" +
                        "14) Транзакция на readOnly=true для методов, которые пишут в БД.",
                "🏰 ДВОРЕЦ ПАМЯТИ: Аудит-комната\n\n" +
                        "Каждый антипаттерн = табличка с ошибкой на стене:\n\n" +
                        "🚫 Field Injection       → «Зависимость спрятана в карман»\n" +
                        "🚫 N+1                   → «Курьер бегает 100 раз»\n" +
                        "🚫 @Transactional private → «Дверь нарисована, но не открывается»\n" +
                        "🚫 Self-invocation        → «Кричит в стену своей же комнаты»\n" +
                        "🚫 System.out             → «Кричит в пустоту, никто не пишет в лог»\n" +
                        "🚫 Empty catch            → «Пациент умер, врач ушёл молча»\n" +
                        "🚫 No @Valid              → «Пограничник спит»\n" +
                        "🚫 Secrets in yml         → «Пароль на стикере у монитора»\n" +
                        "🚫 Open actuator          → «Все двери нараспашку»\n" +
                        "🚫 findAll()              → «Погрузчик выгружает всю библиотеку разом»",
                "🧠 Факт №1: SonarQube автоматически находит 80% этих антипаттернов.\n---\n" +
                        "🧠 Факт №2: field injection запрещён в Spring официально с 4.3 (только constructor).\n---\n" +
                        "🧠 Факт №3: ArchUnit позволяет писать юнит-тесты на архитектурные правила.",
                "review,architecture",
                1
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