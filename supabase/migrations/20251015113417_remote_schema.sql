alter table "public"."feedback" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."invites" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."organizations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."projects" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."widgets" alter column "id" set default extensions.uuid_generate_v4();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_users_lite(ids uuid[])
 RETURNS TABLE(id uuid, email text, full_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id::uuid,
    u.email::text,
    COALESCE((u.raw_user_meta_data->>'full_name')::text, '')::text as full_name
  FROM auth.users u
  WHERE u.id = ANY(ids);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles(user_id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (user_id) do nothing;
  return new;
end; $function$
;

CREATE OR REPLACE FUNCTION public.handle_org_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.memberships(org_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict do nothing;
  return new;
end; $function$
;

CREATE OR REPLACE FUNCTION public.is_org_admin(_org uuid, _user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1 from public.memberships m
    where m.org_id = _org and m.user_id = _user and m.role in ('owner','admin')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_org_member(_org uuid, _user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (select 1 from public.memberships m where m.org_id = _org and m.user_id = _user);
$function$
;

CREATE OR REPLACE FUNCTION public.is_org_member(check_org uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists(
    select 1 from public.memberships m
    where m.org_id = check_org and m.user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.normalize_origins(arr text[])
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$
  select case
    when arr is null then null
    else array(
      select x from (
        select nullif(btrim(elem), '') as x
        from unnest(arr) as t(elem)
      ) s
      where x is not null
    )
  end
$function$
;

CREATE OR REPLACE FUNCTION public.tg_projects_normalize_origins()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.allowed_origins := public.normalize_origins(new.allowed_origins);
  return new;
end $function$
;



