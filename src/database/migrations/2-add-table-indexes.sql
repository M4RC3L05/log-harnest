create index idx_logs_timestamp on logs(timestamp);
create index idx_logs_name on logs(name);
create index idx_logs_name_level on logs(name, level);
create index idx_logs_level on logs(level);
