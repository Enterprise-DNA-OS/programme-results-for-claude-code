INSERT INTO projects(id,code,name,owner,outcome) VALUES
('10000000-0000-4000-8000-000000000001','LEARN','Community learning','Mira','Adults complete practical literacy sessions'),
('10000000-0000-4000-8000-000000000002','WATER','Village water access','Ari','Households have a functioning water point') ON CONFLICT DO NOTHING;
INSERT INTO indicators(id,code,name,unit,aggregation,definition,method,approved_by) VALUES
('20000000-0000-4000-8000-000000000001','ATTEND','Session attendances','attendances','sum','Attendance occasions, not unique people','Sum mutually exclusive location totals within each period','Mira'),
('20000000-0000-4000-8000-000000000002','PASS','Assessment pass rate','percent','weighted-rate','Passed assessments divided by completed assessments','Sum passes and attempts before division, exclude no-shows','Mira'),
('20000000-0000-4000-8000-000000000003','WORKING','Working water points','water points','snapshot','Working points inspected at period end','One verified portfolio snapshot; do not sum periods','Ari') ON CONFLICT DO NOTHING;
INSERT INTO periods(id,code,name,starts_on,ends_on,due_on) VALUES
('30000000-0000-4000-8000-000000000001','PRIOR','Prior reporting cycle',current_date-90,current_date-61,current_date-50),
('30000000-0000-4000-8000-000000000002','CURRENT','Latest reporting cycle',current_date-60,current_date-31,current_date-5),
('30000000-0000-4000-8000-000000000003','NEXT','Next reporting cycle',current_date-30,current_date-1,current_date+10) ON CONFLICT DO NOTHING;
INSERT INTO assignments(id,project_id,indicator_id,period_id,owner,target) VALUES
('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','Mira',150),
('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','Mira',80),
('40000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000002','Ari',8),
('40000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Mira',100),
('40000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000003','Mira',170) ON CONFLICT DO NOTHING;
INSERT INTO cells(id,code,assignment_id,location,dimensions) VALUES
('50000000-0000-4000-8000-000000000001','ATTEND-NORTH','40000000-0000-4000-8000-000000000001','North','{"Cohort":"Adults"}'),
('50000000-0000-4000-8000-000000000002','ATTEND-SOUTH','40000000-0000-4000-8000-000000000001','South','{"Cohort":"Adults"}'),
('50000000-0000-4000-8000-000000000003','PASS-NORTH','40000000-0000-4000-8000-000000000002','North','{}'),
('50000000-0000-4000-8000-000000000004','PASS-SOUTH','40000000-0000-4000-8000-000000000002','South','{}'),
('50000000-0000-4000-8000-000000000005','ATTEND-PRIOR','40000000-0000-4000-8000-000000000004','All sites','{}') ON CONFLICT DO NOTHING;
INSERT INTO result_versions(cell_id,version,value,denominator,evidence,reporter,observed_on,state,reviewed_by,review_note) VALUES
('50000000-0000-4000-8000-000000000001',1,65,NULL,'demo://north-register','Lina',current_date-31,'accepted','Mira','Reconciled attendance occasions'),
('50000000-0000-4000-8000-000000000002',1,55,NULL,'','Ben',current_date-31,'pending',NULL,NULL),
('50000000-0000-4000-8000-000000000003',1,9,10,'demo://north-assessments','Lina',current_date-31,'accepted','Mira','Checked numerator and denominator'),
('50000000-0000-4000-8000-000000000004',1,40,80,'demo://south-assessments','Ben',current_date-31,'accepted','Mira','Checked numerator and denominator'),
('50000000-0000-4000-8000-000000000005',1,90,NULL,'demo://prior-register','Lina',current_date-61,'accepted','Mira','Reconciled prior cycle') ON CONFLICT DO NOTHING;
INSERT INTO actions(id,code,assignment_id,description,owner,due_on) VALUES('60000000-0000-4000-8000-000000000001','VERIFY-SOUTH','40000000-0000-4000-8000-000000000001','Obtain South attendance evidence','Ben',current_date-8) ON CONFLICT DO NOTHING;
INSERT INTO notes(id,project_id,note,actor,created_at) VALUES('70000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','Awaiting inspection returns from partner','Ari',now()-interval '25 days') ON CONFLICT DO NOTHING;
