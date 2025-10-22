-- Dual-write trigger to sync widget_config -> settings for backward compatibility
create or replace function trg_widget_config_sync()
returns trigger as $$
begin
  if TG_OP in ('INSERT','UPDATE') and NEW.widget_config is not null then
    declare first_block jsonb;
    begin
      -- Extract first block's data and sync to settings
      first_block := coalesce(NEW.widget_config->'blocks'->0, '{}'::jsonb);
      NEW.settings := coalesce(first_block->'data', '{}'::jsonb);
    end;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Drop existing trigger if it exists
drop trigger if exists widget_config_sync on public.widget_config;

-- Create trigger for dual-write
create trigger widget_config_sync
before insert or update of widget_config on public.widget_config
for each row execute function trg_widget_config_sync();
