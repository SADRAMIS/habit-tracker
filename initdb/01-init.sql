-- Создаём пользователя tracker, если его ещё нет
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tracker') THEN
        CREATE ROLE tracker WITH LOGIN PASSWORD 'secret';
    END IF;
END
$$;

-- Даём права на базу progress_tracker
GRANT ALL PRIVILEGES ON DATABASE progress_tracker TO tracker;