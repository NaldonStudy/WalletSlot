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

USE walletslotdb;

-- USER
DESCRIBE `user`;
INSERT INTO `user` (id, uuid, name, phone_number, gender, birth_date, base_day, job)
VALUES
(1, UUID(), '전해지', '01012345678', 'FEMALE', '2000-02-24', 26, 'STUDENT'), -- 1234
(2, UUID(), '김영희', '01098765432', 'FEMALE', '1998-07-15', 17, 'OFFICE_WORKER'); -- 4321

-- PEPPER_KEYS
DESCRIBE `pepper_keys`;
INSERT INTO `pepper_keys` (id, key_alias, status)
VALUES
(1, 'pepper_v0', 'RETIRED'),
(2, 'pepper_v1', 'ACTIVATE');

-- USER_PIN
DESCRIBE `user_pin`;
INSERT INTO `user_pin` (id, user_id, pepper_id, bcrypted_pin, cost)
VALUES
(1, 1, 2, '$2a$10$A3RKpRl.p/c0EmIxjDGKBeT5BlLb1/0.b4IPM07oPz2Eu5BtXxjgG', 12),
(2, 2, 2, '$2a$10$ap5WOdWUPrL2I5z/NGw37Oetg.ZtVAc0F3yGyTH.f7/5kAt7DMGXO', 10);

-- BANK
DESCRIBE `bank`;
INSERT INTO `bank` (id, uuid, name, code)
VALUES
(1, UUID(), '한국은행', '001'),
(2, UUID(), '산업은행', '002'),
(3, UUID(), '기업은행', '003'),
(4, UUID(), '국민은행', '004'),
(5, UUID(), '농협은행', '011'),
(6, UUID(), '우리은행', '020'),
(7, UUID(), 'SC제일은행', '023'),
(8, UUID(), '시티은행', '027'),
(9, UUID(), '대구은행', '032'),
(10, UUID(), '광주은행', '034'),
(11, UUID(), '제주은행', '035'),
(12, UUID(), '전북은행', '037'),
(13, UUID(), '경남은행', '039'),
(14, UUID(), '새마을금고', '045'),
(15, UUID(), 'KEB하나은행', '081'),
(16, UUID(), '신한은행', '088'),
(17, UUID(), '카카오뱅크', '090'),
(18, UUID(), '싸피은행', '999');

-- ACCOUNT
DESCRIBE `account`;
INSERT INTO `account` (id, uuid, user_id, bank_id, alias, encrypted_account_no, balance, is_primary)
VALUES
(1, UUID(), 1, 3, null, 'BEblrFzS1Bw8CjTFwO3LDQ==', 5000000, TRUE),
(2, UUID(), 1, 4, '비상금통장', 'Bv/MvZaXq/O/XObHTutrOw==', 2000000, FALSE),
(3, UUID(), 2, 5, null, 'M3MSb/198l1CldcxjmiWKA==', 1000000, TRUE);

-- SLOT
DESCRIBE `slot`;
INSERT INTO `slot` (id, uuid, name, is_saving_slot)
VALUES
(1, UUID(), '식비', FALSE),
(2, UUID(), '교통비', FALSE),
(3, UUID(), '의류/잡화', FALSE),
(4, UUID(), '카페/간식', FALSE),
(5, UUID(), '여가비', FALSE),
(6, UUID(), '의료/건강', FALSE),
(7, UUID(), '저축', TRUE),
(8, UUID(), '자동차비', FALSE),
(9, UUID(), '미용', FALSE),
(10, UUID(), '취미', FALSE),
(11, UUID(), '보험비', FALSE),
(12, UUID(), '통신비', FALSE),
(13, UUID(), '주거비', FALSE),
(14, UUID(), '구독비', FALSE),
(15, UUID(), '육아비', FALSE),
(16, UUID(), '용돈/선물', FALSE),
(17, UUID(), '반려동물', FALSE),
(18, UUID(), '데이트', FALSE),
(19, UUID(), '세금', FALSE),
(20, UUID(), '교육비', FALSE),
(21, UUID(), '경조사', FALSE),
(22, UUID(), '회비', FALSE),
(23, UUID(), '후원', FALSE),
(24, UUID(), '여행/숙박', FALSE),
(25, UUID(), '미분류', FALSE);

-- ACCOUNT_SLOT
DESCRIBE `account_slot`;
INSERT INTO `account_slot` (id, uuid, account_id, slot_id, initial_budget, current_budget)
VALUES
(1, UUID(), 1, 1, 100000, 150000),
(2, UUID(), 1, 2, 50000, 50000),
(3, UUID(), 1, 3, 30000, 30000),
(4, UUID(), 2, 1, 100000, 100000),
(5, UUID(), 2, 2, 50000, 100000),
(6, UUID(), 2, 3, 30000, 30000),
(7, UUID(), 3, 1, 100000, 100000),
(8, UUID(), 3, 2, 50000, 50000),
(9, UUID(), 3, 3, 30000, 60000);

-- SLOT_HISTORY
DESCRIBE `slot_history`;
INSERT INTO `slot_history` (id, uuid, account_slot_id, old_budget, new_budget)
VALUES
(1, UUID(), 1, 100000, 150000),
(2, UUID(), 5, 50000, 100000),
(3, UUID(), 9, 30000, 60000);

-- TRANSACTION
DESCRIBE `transaction`;
INSERT INTO `transaction` (id, uuid, account_id, account_slot_id, unique_no, type, opponent_account_no, summary, amount, balance, transaction_at)
VALUES
(1, UUID(), 1, 1, 10001, '출금', null, '스타벅스 도안dt점', 4500, 4995500, '2025-09-10 12:30:00'),
(2, UUID(), 1, 2, 10002, '출금(이체)', '444433332222', '박형복', 300000, 4695500, '2025-09-11 08:10:00');

-- CONSENT_FORM
DESCRIBE `consent_form`;
INSERT INTO `consent_form` (id, uuid, title)
VALUES
(1, UUID(), '개인정보 수집 및 이용 동의'),
(2, UUID(), '서비스 이용 약관');

-- USER_CONSENT
DESCRIBE `user_consent`;
INSERT INTO `user_consent` (id, user_id, consent_form_id, expired_at)
VALUES
(1, 1, 1, '2026-09-17 00:20:01'),
(2, 1, 2, '2026-09-17 00:20:01'),
(3, 2, 1, '2026-09-20 14:02:16');

-- PUSH_ENDPOINT
DESCRIBE `push_endpoint`;
INSERT INTO `push_endpoint` (id, user_id, device_id, platform, token)
VALUES
(1, 1, '1234', 'ANDROID', 'fcm_token_abc123'),
(2, 2, '1234', 'IOS', 'fcm_token_def456');

-- NOTIFICATION
DESCRIBE `notification`;
INSERT INTO `notification` (id, uuid, user_id, title, content, is_delivered, delivered_at, type)
VALUES
(1, UUID(), 1, '예산 초과 알림', '식비 예산을 초과했습니다.', TRUE, '2025-09-20 15:00:03', ''),
(2, UUID(), 2, '로그인 알림', '새로운 기기에서 로그인되었습니다.', TRUE, '2025-09-20 14:02:15', '');

-- WISHLIST
DESCRIBE `wishlist`;
INSERT INTO `wishlist` (id, uuid, user_id, name, price)
VALUES
(1, UUID(), 1, '아이패드', 1200000),
(2, UUID(), 2, '에어팟', 250000);

-- EMAIL
DESCRIBE `email`;
INSERT INTO `email` (id, user_id, name, email)
VALUES
(1, 1, '전해지', 'wjsgowl0224@naver.com'),
(2, 2, '김영희', 'kim@student.com');
