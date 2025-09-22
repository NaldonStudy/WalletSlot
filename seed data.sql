-- Seed data only (스키마 생성 후 실행)
USE walletslotdb;

-- 안전하게 초기화
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `transaction`;
TRUNCATE TABLE `slot_history`;
TRUNCATE TABLE `account_slot`;
TRUNCATE TABLE `ai_report`;
TRUNCATE TABLE `notification`;
TRUNCATE TABLE `push_endpoint`;
TRUNCATE TABLE `user_pin`;
TRUNCATE TABLE `user_consent`;
TRUNCATE TABLE `wishlist`;
TRUNCATE TABLE `email`;
TRUNCATE TABLE `account`;
TRUNCATE TABLE `bank`;
TRUNCATE TABLE `slot`;
TRUNCATE TABLE `pepper_keys`;
TRUNCATE TABLE `consent_form`;
TRUNCATE TABLE `user`;
SET FOREIGN_KEY_CHECKS = 1;

-- USER
INSERT INTO `user` (id, uuid, name, user_key, phone_number, gender, birth_date, base_day, job)
VALUES
(1, UUID(), '전해지', 'd022c753-e3f0-4d58-a405-ee8a058fd199', '01012345678', 'FEMALE', '2000-02-24 00:00:00', 26, 'STUDENT'),
(2, UUID(), '김영희', 'e733b8b5-1a2f-4b88-b3b3-2e8a0c28d111', '01098765432', 'FEMALE', '1998-07-15 00:00:00', 17, 'OFFICE_WORKER');

-- PEPPER_KEYS
INSERT INTO `pepper_keys` (id, key_alias, status)
VALUES
(1, 'pepper_v0', 'RETIRED'),
(2, 'pepper_v1', 'ACTIVATE');

-- USER_PIN
INSERT INTO `user_pin` (id, user_id, pepper_id, bcrypted_pin, cost)
VALUES
(1, 1, 2, '$2a$10$A3RKpRl.p/c0EmIxjDGKBeT5BlLb1/0.b4IPM07oPz2Eu5BtXxjgG', 12),
(2, 2, 2, '$2a$10$ap5WOdWUPrL2I5z/NGw37Oetg.ZtVAc0F3yGyTH.f7/5kAt7DMGXO', 10);

-- BANK
INSERT INTO `bank` (id, uuid, name, code, color)
VALUES
(1, UUID(), '한국은행', '001', NULL),
(2, UUID(), '산업은행', '002', NULL),
(3, UUID(), '기업은행', '003', NULL),
(4, UUID(), '국민은행', '004', NULL),
(5, UUID(), '농협은행', '011', NULL),
(6, UUID(), '우리은행', '020', NULL),
(7, UUID(), 'SC제일은행', '023', NULL),
(8, UUID(), '시티은행', '027', NULL),
(9, UUID(), '대구은행', '032', NULL),
(10, UUID(), '광주은행', '034', NULL),
(11, UUID(), '제주은행', '035', NULL),
(12, UUID(), '전북은행', '037', NULL),
(13, UUID(), '경남은행', '039', NULL),
(14, UUID(), '새마을금고', '045', NULL),
(15, UUID(), 'KEB하나은행', '081', NULL),
(16, UUID(), '신한은행', '088', NULL),
(17, UUID(), '카카오뱅크', '090', NULL),
(18, UUID(), '싸피은행', '999', NULL);

-- ACCOUNT
INSERT INTO `account` (id, uuid, user_id, bank_id, alias, encrypted_account_no, balance, is_primary)
VALUES
(1, UUID(), 1, 3, NULL, 'BEblrFzS1Bw8CjTFwO3LDQ==', 5000000, TRUE),
(2, UUID(), 1, 4, '비상금통장', 'Bv/MvZaXq/O/XObHTutrOw==', 2000000, FALSE),
(3, UUID(), 2, 5, NULL, 'M3MSb/198l1CldcxjmiWKA==', 1000000, TRUE);

-- SLOT
INSERT INTO `slot` (id, uuid, name, is_saving, icon, color, `rank`)
VALUES
(1, UUID(), '식비', FALSE, NULL, NULL, NULL),
(2, UUID(), '교통비', FALSE, NULL, NULL, NULL),
(3, UUID(), '의류/잡화', FALSE, NULL, NULL, NULL),
(4, UUID(), '카페/간식', FALSE, NULL, NULL, NULL),
(5, UUID(), '여가비', FALSE, NULL, NULL, NULL),
(6, UUID(), '의료/건강', FALSE, NULL, NULL, NULL),
(7, UUID(), '저축', TRUE, NULL, NULL, NULL),
(8, UUID(), '자동차비', FALSE, NULL, NULL, NULL),
(9, UUID(), '미용', FALSE, NULL, NULL, NULL),
(10, UUID(), '취미', FALSE, NULL, NULL, NULL),
(11, UUID(), '보험비', FALSE, NULL, NULL, NULL),
(12, UUID(), '통신비', FALSE, NULL, NULL, NULL),
(13, UUID(), '주거비', FALSE, NULL, NULL, NULL),
(14, UUID(), '구독비', FALSE, NULL, NULL, NULL),
(15, UUID(), '육아비', FALSE, NULL, NULL, NULL),
(16, UUID(), '용돈/선물', FALSE, NULL, NULL, NULL),
(17, UUID(), '반려동물', FALSE, NULL, NULL, NULL),
(18, UUID(), '데이트', FALSE, NULL, NULL, NULL),
(19, UUID(), '세금', FALSE, NULL, NULL, NULL),
(20, UUID(), '교육비', FALSE, NULL, NULL, NULL),
(21, UUID(), '경조사', FALSE, NULL, NULL, NULL),
(22, UUID(), '회비', FALSE, NULL, NULL, NULL),
(23, UUID(), '후원', FALSE, NULL, NULL, NULL),
(24, UUID(), '여행/숙박', FALSE, NULL, NULL, NULL),
(25, UUID(), '미분류', FALSE, NULL, NULL, NULL);

-- ACCOUNT_SLOT
INSERT INTO `account_slot` (id, uuid, account_id, slot_id, initial_budget, current_budget, spent, budget_change_count, is_budget_exceeded, is_custom, custom_name)
VALUES
(1, UUID(), 1, 1, 100000, 150000, 0, 1, FALSE, FALSE, NULL),
(2, UUID(), 1, 2, 50000, 50000, 0, 0, FALSE, FALSE, NULL),
(3, UUID(), 1, 3, 30000, 30000, 0, 0, FALSE, FALSE, NULL),
(4, UUID(), 2, 1, 100000, 100000, 0, 0, FALSE, FALSE, NULL),
(5, UUID(), 2, 2, 50000, 100000, 0, 1, FALSE, FALSE, NULL),
(6, UUID(), 2, 3, 30000, 30000, 0, 0, FALSE, FALSE, NULL),
(7, UUID(), 3, 1, 100000, 100000, 0, 0, FALSE, FALSE, NULL),
(8, UUID(), 3, 2, 50000, 50000, 0, 0, FALSE, FALSE, NULL),
(9, UUID(), 3, 3, 30000, 60000, 0, 1, FALSE, FALSE, NULL);

-- SLOT_HISTORY
INSERT INTO `slot_history` (id, uuid, account_slot_id, old_budget, new_budget)
VALUES
(1, UUID(), 1, 100000, 150000),
(2, UUID(), 5, 50000, 100000),
(3, UUID(), 9, 30000, 60000);

-- TRANSACTION
INSERT INTO `transaction` (id, uuid, account_id, account_slot_id, unique_no, type, opponent_account_no, summary, amount, balance, transaction_at)
VALUES
(1, UUID(), 1, 1, 10001, '출금', NULL, '스타벅스 도안DT점', 4500, 4995500, '2025-09-10 12:30:00'),
(2, UUID(), 1, 2, 10002, '출금(이체)', 444433332222, '박형복', 300000, 4695500, '2025-09-11 08:10:00');

-- CONSENT_FORM
INSERT INTO `consent_form` (id, uuid, title)
VALUES
(1, UUID(), '개인정보 수집 및 이용 동의'),
(2, UUID(), '서비스 이용 약관');

-- USER_CONSENT
INSERT INTO `user_consent` (id, uuid, user_id, consent_form_id, expired_at, status)
VALUES
(1, UUID(), 1, 1, '2026-09-17 00:20:01', 'ACTIVE'),
(2, UUID(), 1, 2, '2026-09-17 00:20:01', 'ACTIVE'),
(3, UUID(), 2, 1, '2026-09-20 14:02:16', 'ACTIVE');

-- PUSH_ENDPOINT
INSERT INTO `push_endpoint` (id, user_id, device_id, platform, token, status, is_push_enabled)
VALUES
(1, 1, 'device-1234', 'ANDROID', 'fcm_token_abc123', 'ACTIVE', TRUE),
(2, 2, 'device-5678', 'IOS', 'fcm_token_def456', 'ACTIVE', TRUE);

-- NOTIFICATION  (ENUM: SYSTEM, DEVICE, BUDGET, TRANSACTION, MARKETING)
INSERT INTO `notification` (id, uuid, user_id, title, content, is_delivered, delivered_at, is_read, read_at, type)
VALUES
(1, UUID(), 1, '예산 초과 알림', '식비 예산을 초과했습니다.', TRUE, '2025-09-20 15:00:03', FALSE, NULL, 'BUDGET'),
(2, UUID(), 2, '로그인 알림', '새로운 기기에서 로그인되었습니다.', TRUE, '2025-09-20 14:02:15', FALSE, NULL, 'DEVICE');

-- WISHLIST
INSERT INTO `wishlist` (id, uuid, user_id, name, price, image)
VALUES
(1, UUID(), 1, '아이패드', 1200000, NULL),
(2, UUID(), 2, '에어팟', 250000, NULL);

-- EMAIL
INSERT INTO `email` (id, user_id, name, email)
VALUES
(1, 1, '전해지', 'wjsgowl0224@naver.com'),
(2, 2, '김영희', 'kim@student.com');

-- AI_REPORT (옵션)
INSERT INTO `ai_report` (id, uuid, account_id, content)
VALUES
(1, UUID(), 1, JSON_OBJECT('summary', '이번달 식비 과다', 'advice', '다음달 식비 예산 상향 또는 지출 절감'));

SELECT * FROM `user`;
SELECT * FROM `pepper_keys`;
SELECT * FROM `user_pin`;
SELECT * FROM `bank`;
SELECT * FROM `account`;
SELECT * FROM `slot`;
SELECT * FROM `account_slot`;
SELECT * FROM `slot_history`;
SELECT * FROM `transaction`;
SELECT * FROM `consent_form`;
SELECT * FROM `user_consent`;
SELECT * FROM `push_endpoint`;
SELECT * FROM `notification`;
SELECT * FROM `wishlist`;
SELECT * FROM `email`;
