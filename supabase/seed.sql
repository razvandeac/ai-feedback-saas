insert into orgs (name) values ('Dev Org') returning id;
-- copy that id; then:
-- insert into projects (org_id, name) values ('<ORG_ID>', 'Dev Project') returning id;
