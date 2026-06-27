-- Create the jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed
    priority INTEGER NOT NULL DEFAULT 0, -- Higher number = higher priority
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index to quickly find jobs that are ready to run
CREATE INDEX IF NOT EXISTS idx_jobs_status_run_at ON jobs(status, run_at) WHERE status = 'queued';
-- Index for prioritizing higher priority jobs
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority DESC);

-- Create the dead_letters table
CREATE TABLE IF NOT EXISTS dead_letters (
    id INTEGER PRIMARY KEY, -- Same ID as the original job
    payload JSONB NOT NULL,
    priority INTEGER NOT NULL,
    attempts INTEGER NOT NULL,
    failed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
