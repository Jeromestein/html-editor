# GPA 计算规则（来自 GPACalculator.tsx）

## 计分标准（GRADE_POINTS）

- A+ = 4.35（最高）
- A = 4.00
- A- = 3.65
- B+ = 3.35
- B = 3.00
- B- = 2.65
- C+ = 2.35
- C = 2.00
- C- = 1.65
- D+ = 1.35
- D = 1.00
- D- = 0.65
- F / FAIL = 0.00
- WF = 0.00
- P / PASS / CR / CREDIT / T = 0.00

## 计入 GPA 的规则

- GPA 的公式：`finalGPA = totalPoints / gpaCredits`，如果 `gpaCredits` 为 0，则 GPA 为 0。
- `totalPoints` 只累计 “计入 GPA” 的课程：`credits * gradePoint`。
- `gpaCredits` 只累计计入 GPA 的课程学分。
- `totalCredits` 会累计所有能识别到的有效成绩（包括 P/PASS/CR 和 WF/F）。
- `P` / `PASS` / `CR` / `CREDIT` / `T` 只计学分，不计入 GPA。
- `F` / `FAIL` / `WF` 计入 GPA，分值为 0。

## 成绩标准化（Normalization）

- 成绩统一转为大写并去空格。
- 别名规则：
  - `FAIL` -> `F`
- `PASS` -> `P`
- `CREDIT` -> `CR`

## 输入解析规则

- 每行一门课：`课程名 [Tab 或空格] 学分 [Tab 或空格] 成绩`。
- 先按 Tab 拆分；若不是 3 段，再把多个空格合并后按空格拆分。
- 解析策略：
  - 最后一个字段视为成绩。
  - 从倒数第二个字段向前找第一个可解析为数字的字段，视为学分。
  - 只有当成绩在 `GRADE_POINTS` 中存在时才计入统计。

## 统计展示（分布）

- 内部会初始化所有 `GRADE_POINTS` 的分布项（不包含别名）。
- 输出时合并展示：
  - `F` 与 `WF` 合并为 `F/WF`
- `P` 与 `CR` 合并为 `P/CR`（`CREDIT` 会归入 `CR`，`T` 单独显示）
