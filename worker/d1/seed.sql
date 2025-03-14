INSERT INTO plans (date, praise_scope, praise_content, devotional_scope) VALUES
  ('2025-01-01', '歷代志上 16:34 CCB', '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！', '出埃及記 第 8 章')
  ON CONFLICT (date) DO UPDATE SET
    praise_scope = '歷代志上 16:34 CCB',
    praise_content = '你們要稱謝耶和華，因為祂是美善的，祂的慈愛永遠長存！',
    devotional_scope = '出埃及記 第 8 章';

INSERT INTO recipients (id) VALUES
  ('YOUR-LINE-GROUP-ID')
  ON CONFLICT (id) DO NOTHING;
