SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 679TX8fVzIlE9cAOhfXRq5ze3xETHup1e0XJhGRS23akTzm9CtR7hKTwMM7s9ae

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organizations" ("id", "name", "slug", "created_by", "created_at") VALUES
	('a9523bc1-fff1-4773-bdba-dd494d055ba8', 'Demo Org', 'demo', 'ac07520e-3367-471b-8bac-ac24f4f127cf', '2025-10-13 10:39:20.210321+00');


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."projects" ("id", "org_id", "name", "key", "created_at", "allowed_origins", "require_project_origins") VALUES
	('8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', 'a9523bc1-fff1-4773-bdba-dd494d055ba8', 'Main Website', 'y577qucpaczh6fty', '2025-10-13 10:39:20.210321+00', NULL, false);


--
-- Data for Name: widgets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."events" ("id", "project_id", "widget_id", "type", "payload", "user_agent", "ip", "created_at") VALUES
	(1, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"source": "seed"}', NULL, NULL, '2025-10-06 10:40:20.908177+00'),
	(2, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'feedback.submit', '{"comment": "All works except nothing works!"}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 11:18:47.950797+00'),
	(3, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"source": "test"}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:42:26.308606+00'),
	(4, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"source": "test"}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:42:40.517218+00'),
	(5, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760377730224}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:48:50.835918+00'),
	(6, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.closed', '{"ts": 1760377770272}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:49:30.978694+00'),
	(7, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760377770906}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:49:31.480072+00'),
	(8, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.closed', '{"ts": 1760377793611}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:49:54.254282+00'),
	(9, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760377794156}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:49:54.720506+00'),
	(10, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760377794175}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:49:54.735321+00'),
	(11, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.closed', '{"ts": 1760377807913}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:50:08.61409+00'),
	(12, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760377808549}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:50:09.113487+00'),
	(13, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760377808575}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:50:09.129032+00'),
	(14, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.closed', '{"ts": 1760377843464}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:50:44.099963+00'),
	(15, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760377844069}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:50:44.69844+00'),
	(16, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760377871706}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:51:12.248016+00'),
	(17, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'feedback.started', '{"via": "rating"}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:51:17.001164+00'),
	(18, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'feedback.submit', '{"rating": 3}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:51:20.22659+00'),
	(19, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378212283}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 17:56:52.981862+00'),
	(20, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378654536}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:04:15.563252+00'),
	(21, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'feedback.started', '{"via": "rating"}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:04:36.166896+00'),
	(22, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378727884}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:05:28.555152+00'),
	(23, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378733372}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:05:34.023639+00'),
	(24, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378748787}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:05:49.550395+00'),
	(25, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378787077}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:06:27.69052+00'),
	(26, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378807816}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:06:48.400182+00'),
	(27, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378812330}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:06:52.923045+00'),
	(28, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378819921}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:07:00.571203+00'),
	(29, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378827232}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:07:07.805819+00'),
	(30, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378843375}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:07:24.012102+00'),
	(31, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378875629}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:07:56.288933+00'),
	(32, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'feedback.started', '{"via": "rating"}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:08:04.712662+00'),
	(33, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'feedback.submit', '{"rating": 3}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:08:09.957486+00'),
	(34, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760378937122}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:08:57.871456+00'),
	(35, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760379004420}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:10:05.029028+00'),
	(36, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760379047664}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:10:48.282073+00'),
	(37, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760379078706}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:11:19.353282+00'),
	(38, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760379132868}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:12:13.510961+00'),
	(39, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760379221155}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:13:41.78344+00'),
	(40, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760379526422}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:18:47.07246+00'),
	(41, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760380475778}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:34:36.444186+00'),
	(42, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760380584048}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:36:24.624702+00'),
	(43, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760380617901}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:36:58.611946+00'),
	(44, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760380657249}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:37:37.7622+00'),
	(45, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760380658800}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:37:39.389904+00'),
	(46, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760380660816}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:37:41.351243+00'),
	(47, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760381236940}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:47:17.491631+00'),
	(48, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760381522961}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:52:04.922968+00'),
	(49, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760381532905}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:52:13.547755+00'),
	(50, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760381541968}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:52:22.565476+00'),
	(51, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760381575158}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:52:55.758028+00'),
	(52, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760381645435}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:54:05.954581+00'),
	(53, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760381648298}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:54:08.896651+00'),
	(54, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760381650986}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:54:11.624811+00'),
	(55, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760381739720}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 18:55:40.222951+00'),
	(56, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760382003988}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 19:00:04.518009+00'),
	(57, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760382115408}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 19:01:55.902896+00'),
	(58, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760383469453}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-13 19:24:29.927742+00'),
	(59, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760428552581}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-14 07:55:53.247882+00'),
	(60, '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 'widget.opened', '{"ts": 1760550347864}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '::1', '2025-10-15 17:45:48.407735+00');


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."feedback" ("id", "project_id", "widget_id", "rating", "comment", "metadata", "created_at", "org_id") VALUES
	('b57d60c7-a383-4f87-b63b-c5a178e8cd2d', '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 5, 'Loved the new dashboard!', '{}', '2025-10-12 10:39:20.210321+00', 'a9523bc1-fff1-4773-bdba-dd494d055ba8'),
	('15259b0e-77cd-4fc7-b3f0-d1606e17025d', '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 4, 'Everything works fine.', '{}', '2025-10-11 10:39:20.210321+00', 'a9523bc1-fff1-4773-bdba-dd494d055ba8'),
	('d09ce292-6aa4-4196-892b-75d8ce56f12b', '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 3, 'Loading feels a bit slow.', '{}', '2025-10-10 10:39:20.210321+00', 'a9523bc1-fff1-4773-bdba-dd494d055ba8'),
	('3f6cf8e8-b8f7-465f-908a-d1050ae19a77', '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 1, 'Buggy form on mobile.', '{}', '2025-10-09 10:39:20.210321+00', 'a9523bc1-fff1-4773-bdba-dd494d055ba8'),
	('044ad471-393a-4525-b75b-9c9261095570', '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 3, NULL, '{}', '2025-10-13 17:51:20.374915+00', 'a9523bc1-fff1-4773-bdba-dd494d055ba8'),
	('eeb26d2e-fece-4d4b-b6b7-81f6222e6f06', '8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', NULL, 3, NULL, '{}', '2025-10-13 18:08:10.121299+00', 'a9523bc1-fff1-4773-bdba-dd494d055ba8');


--
-- Data for Name: invites; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."memberships" ("org_id", "user_id", "role", "created_at") VALUES
	('a9523bc1-fff1-4773-bdba-dd494d055ba8', 'ac07520e-3367-471b-8bac-ac24f4f127cf', 'owner', '2025-10-13 10:39:20.210321+00'),
	('a9523bc1-fff1-4773-bdba-dd494d055ba8', '9e987adb-3b91-4fac-8fef-47c1fe3e6921', 'member', '2025-10-14 09:50:10.522138+00');


--
-- Data for Name: org_invites; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."org_invites" ("id", "org_id", "email", "role", "invited_by", "token", "status", "created_at", "accepted_at") VALUES
	('6e588a0d-d8ab-4d14-aa17-ad19da8ee4b1', 'a9523bc1-fff1-4773-bdba-dd494d055ba8', 'razvan.deac@gmail.com', 'member', 'ac07520e-3367-471b-8bac-ac24f4f127cf', '7e4d2e56-815a-4d59-aa34-5987a7583bbd', 'revoked', '2025-10-13 15:13:10.467357+00', NULL),
	('d929c5c7-a911-44ae-b97a-5f2a0552e844', 'a9523bc1-fff1-4773-bdba-dd494d055ba8', 'razvan.deac.baia.mare.0001@gmail.com', 'member', 'ac07520e-3367-471b-8bac-ac24f4f127cf', '04456b74-8569-4057-98b6-8b7727097004', 'revoked', '2025-10-13 15:11:20.255966+00', NULL),
	('984f634a-84dd-4c14-978f-a3b47f9a367e', 'a9523bc1-fff1-4773-bdba-dd494d055ba8', 'razvan.deac@gmail.com', 'member', 'ac07520e-3367-471b-8bac-ac24f4f127cf', '1d44c0ef-848b-4580-92e5-56831516d99a', 'revoked', '2025-10-13 15:09:13.175429+00', NULL),
	('531822b9-c4f5-4059-af2f-4d0e6a5a6478', 'a9523bc1-fff1-4773-bdba-dd494d055ba8', 'razvan.deac.dev2@gmail.com', 'member', 'ac07520e-3367-471b-8bac-ac24f4f127cf', '5ffebc27-bc46-4dec-a77d-286b3c6eba5a', 'revoked', '2025-10-14 07:42:55.941504+00', NULL),
	('3458b29d-fb55-4c62-8856-1c4da00e44f9', 'a9523bc1-fff1-4773-bdba-dd494d055ba8', 'razvan.deac.dev2@gmail.com', 'member', 'ac07520e-3367-471b-8bac-ac24f4f127cf', '2a77f888-9749-4d46-b325-b11fc78f66fe', 'accepted', '2025-10-14 08:10:28.597276+00', '2025-10-14 09:50:10.509+00');


--
-- Data for Name: org_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."org_members" ("org_id", "user_id", "role", "created_at") VALUES
	('a9523bc1-fff1-4773-bdba-dd494d055ba8', 'ac07520e-3367-471b-8bac-ac24f4f127cf', 'owner', '2025-10-13 10:39:20.210321+00'),
	('a9523bc1-fff1-4773-bdba-dd494d055ba8', '9e987adb-3b91-4fac-8fef-47c1fe3e6921', 'member', '2025-10-14 09:50:10.522138+00');


--
-- Data for Name: platform_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."platform_admins" ("email") VALUES
	('razvan.deac@gmail.com');


--
-- Data for Name: platform_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."platform_feedback" ("id", "source", "rating", "comment", "email", "metadata", "status", "created_at") VALUES
	('5c08fb51-eadf-41a0-b33f-62adc973b721', 'app', NULL, 'good', '', NULL, 'new', '2025-10-14 08:38:03.384655+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("user_id", "full_name", "avatar_url", "created_at") VALUES
	('ac07520e-3367-471b-8bac-ac24f4f127cf', NULL, NULL, '2025-10-12 12:16:38.922911+00'),
	('9e987adb-3b91-4fac-8fef-47c1fe3e6921', NULL, NULL, '2025-10-14 09:49:00.171888+00');


--
-- Data for Name: responses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: widget_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."widget_config" ("project_id", "settings", "updated_at") VALUES
	('8f0cb218-8df3-4dbd-944a-0cd6a4be64c6', '{"theme": "light", "title": "We value your feedback!", "logoUrl": "", "showRating": true, "showComment": false, "primaryColor": "#2494eb"}', '2025-10-13 16:14:21.542+00');


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."events_id_seq"', 60, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict 679TX8fVzIlE9cAOhfXRq5ze3xETHup1e0XJhGRS23akTzm9CtR7hKTwMM7s9ae

RESET ALL;
