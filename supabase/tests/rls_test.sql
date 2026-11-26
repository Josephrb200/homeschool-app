-- Row-level security tests. Run after stub_auth.sql and the migrations.
-- Each block acts as one user and checks what they can and can't do.
\set ON_ERROR_STOP on
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Two families: parent P1 with child S1, parent P2 with child S2.
insert into auth.users values
 ('11111111-0000-0000-0000-000000000001', '{}', '{"display_name":"Parent One"}'),
 ('11111111-0000-0000-0000-000000000002', '{"role":"student"}', '{"display_name":"Sam"}'),
 ('22222222-0000-0000-0000-000000000001', '{}', '{"display_name":"Parent Two"}'),
 ('22222222-0000-0000-0000-000000000002', '{"role":"student"}', '{"display_name":"Alex"}'),
 ('33333333-0000-0000-0000-000000000001', '{"role":"student"}', '{"display_name":"Sneaky"}');
-- a sign-up that tries to make itself an editor through user metadata stays a parent
insert into auth.users values ('44444444-0000-0000-0000-000000000001', '{}', '{"display_name":"X","role":"editor"}');
do $$ begin assert (select role from profiles where id='44444444-0000-0000-0000-000000000001')='parent', 'user metadata must not set role'; end $$;

insert into students values
 ('11111111-0000-0000-0000-000000000002','sam_one','11111111-0000-0000-0000-000000000001'),
 ('22222222-0000-0000-0000-000000000002','alex_two','22222222-0000-0000-0000-000000000001');
insert into guardian_links values
 ('11111111-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002'),
 ('22222222-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000002');
insert into learning_events (student_id, skill_id, kind, mode, question_id, correct, assisted, outcome)
values ('22222222-0000-0000-0000-000000000002','frac-equivalent','attempt','independent','q:1:1',true,false,'correct');

-- Student S1
set role authenticated; set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000002';
insert into learning_events (student_id, skill_id, kind, mode, question_id, correct, assisted, outcome)
values ('11111111-0000-0000-0000-000000000002','frac-equivalent','attempt','independent','q:1:2',true,false,'correct');
do $$ begin assert (select count(*) from learning_events)=1, 'student sees only own events'; end $$;
do $$ begin assert (select count(*) from profiles)=2, 'student sees self and own parent only'; end $$;
do $$ begin
  begin
    insert into learning_events (student_id, skill_id, kind, mode, question_id, correct, assisted)
    values ('22222222-0000-0000-0000-000000000002','frac-equivalent','attempt','independent','q',true,false);
    raise exception 'FAIL: wrote another child''s record';
  exception when insufficient_privilege then null; end;
end $$;
update learning_events set correct=false; -- no update policy: changes nothing
do $$ begin assert (select bool_and(correct) from learning_events), 'student cannot edit attempts'; end $$;
delete from learning_events; -- RLS has no delete policy: silently deletes nothing
do $$ begin assert (select count(*) from learning_events)=1, 'student cannot delete attempts'; end $$;
do $$ begin
  begin update profiles set role='editor' where id=auth.uid(); raise exception 'FAIL: changed own role';
  exception when insufficient_privilege or check_violation then null; end;
end $$;
reset role;

-- Parent P1
set role authenticated; set request.jwt.claim.sub = '11111111-0000-0000-0000-000000000001';
do $$ begin assert (select count(*) from learning_events)=1, 'parent sees own child events only'; end $$;
do $$ begin assert (select count(*) from students)=1, 'parent sees own child only'; end $$;
do $$ begin
  begin
    insert into learning_events (student_id, skill_id, kind, mode, question_id, correct, assisted)
    values ('11111111-0000-0000-0000-000000000002','frac-equivalent','attempt','check','q',true,false);
    raise exception 'FAIL: parent wrote attempts for child';
  exception when insufficient_privilege then null; end;
end $$;
insert into goals (student_id, set_by, week_start, text) values ('11111111-0000-0000-0000-000000000002', auth.uid(), current_date, 'Secure two fraction skills');
do $$ begin
  begin
    insert into goals (student_id, set_by, week_start, text) values ('22222222-0000-0000-0000-000000000002', auth.uid(), current_date, 'x');
    raise exception 'FAIL: goal for another family';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Parent P2 cannot see family one
set role authenticated; set request.jwt.claim.sub = '22222222-0000-0000-0000-000000000001';
do $$ begin assert (select count(*) from goals)=0, 'other family goals hidden'; end $$;
do $$ begin assert not exists(select 1 from students where username='sam_one'), 'other family child hidden'; end $$;
reset role;

-- An unlinked student account sees nothing of anyone else
set role authenticated; set request.jwt.claim.sub = '33333333-0000-0000-0000-000000000001';
do $$ begin assert (select count(*) from learning_events)=0 and (select count(*) from profiles)=1, 'isolated'; end $$;
reset role;

-- Even the database owner can't rewrite history: the trigger blocks updates.
do $$ begin
  begin update learning_events set correct=false; raise exception 'FAIL: owner edited an attempt';
  exception when raise_exception then if sqlerrm not like '%append-only%' then raise; end if; end;
end $$;

select 'ALL RLS TESTS PASSED' as result;
