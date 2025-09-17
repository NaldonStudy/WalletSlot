USE walletslotdb;

-- USER
INSERT INTO `user` (name, phone_number, gender, birth_date, base_day, job)
VALUES
('홍길동', '010-1234-5678', 'MAN', '1995-05-20', 25, 'OFFICE_WORKER'),
('김영희', '010-9876-5432', 'FEMALE', '1998-07-15', NULL, 'STUDENT');

-- PEPPER_KEYS
INSERT INTO `pepper_keys` (key_alias, status)
VALUES
('pepper_v1', 'ACTIVATE'),
('pepper_v0', 'RETIRED');

-- USER_PIN
INSERT INTO `user_pin` (user_id, pepper_id, bcrypted_pin, cost)
VALUES
(1, 1, '$2b$12$abcdefghijklmnopqrstuv1234567890abcd', 12),
(2, 1, '$2b$10$zyxwvutsrqponmlkjihgfedcba0987654321', 10);

-- BANK
INSERT INTO `bank` (name, code, color)
VALUES
('KB국민은행', '004', '#FFD700'),
('신한은행', '088', '#003399');

-- ACCOUNT
INSERT INTO `account` (user_id, bank_id, alias, encrypted_account_no, balance, is_primary)
VALUES
(1, 1, '내 월급통장', 'enc_acc_no_123', 5000000, TRUE),
(1, 2, '비상금통장', 'enc_acc_no_456', 2000000, FALSE),
(2, 1, '생활비통장', 'enc_acc_no_789', 1000000, TRUE);

-- SLOT
INSERT INTO `slot` (uuid, name, is_saving_slot, color, slot_rank)
VALUES
(UUID(), '식비', FALSE, '#FF6666', 1),
(UUID(), '교통비', FALSE, '#66CCFF', 2),
(UUID(), '저축', TRUE, '#33CC33', 3);

-- ACCOUNT_SLOT
INSERT INTO `account_slot` (account_id, slot_id, initial_budget, current_budget, spent, is_custom)
VALUES
(1, 1, 300000, 300000, 0, FALSE),
(1, 2, 100000, 100000, 0, FALSE),
(1, 3, 500000, 500000, 0, FALSE);

-- SLOT_HISTORY
INSERT INTO `slot_history` (account_slot_id, old_budget, new_budget)
VALUES
(1, 300000, 350000),
(2, 100000, 120000);

-- TRANSACTION
INSERT INTO `transaction` (account_id, account_slot_id, uuid, unique_no, type, opponent_account_no, counter_party, amount, balance, transaction_at)
VALUES
(1, 1, UUID(), 10001, 'DEPOSIT', 111122223333, '스타벅스', 4500, 4995500, '2025-09-10 12:30:00'),
(1, 2, UUID(), 10002, 'WITHDRAW', 444433332222, '버스', 1250, 4994250, '2025-09-11 08:10:00');

-- CONSENT_FORM
INSERT INTO `consent_form` (title)
VALUES
('개인정보 수집 및 이용 동의'),
('서비스 이용 약관');

-- USER_CONSENT
INSERT INTO `user_consent` (user_id, consent_form_id, expired_at)
VALUES
(1, 1, '2026-09-17'),
(1, 2, '2026-09-17'),
(2, 1, '2026-09-17');

-- PUSH_ENDPOINT
INSERT INTO `push_endpoint` (user_id, device_id, platform, token)
VALUES
(1, 'device-abc-123', 'ANDROID', 'fcm_token_abc123'),
(2, 'device-def-456', 'IOS', 'fcm_token_def456');

-- AI_REPORT
INSERT INTO `ai_report` (uuid, account_id, content)
VALUES
(UUID(), 1, JSON_OBJECT('summary', '이번 달 식비가 예산을 초과했습니다.')),
(UUID(), 2, JSON_OBJECT('summary', '교통비가 예산보다 20% 적게 사용되었습니다.'));

-- NOTIFICATION
INSERT INTO `notification` (user_id, title, content, is_delivered, type)
VALUES
(1, '예산 초과 알림', '식비 예산을 초과했습니다.', TRUE, ''),
(2, '로그인 알림', '새로운 기기에서 로그인되었습니다.', TRUE, '');

-- WISH_LIST
INSERT INTO `wish_list` (user_id, name, price)
VALUES
(1, '아이패드', 1200000),
(2, '에어팟', 250000);

-- EMAIL
INSERT INTO `email` (user_id, name, email)
VALUES
(1, '개인 이메일', 'hong@test.com'),
(2, '학교 이메일', 'kim@student.com');
