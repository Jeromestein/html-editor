---
name: aice-fce-reference
description: Retrieves authoritative bibliographic references for Foreign Credential Evaluation (FCE) based on AICE standards.
---

# AICE FCE Reference Skill

This skill assists in identifying the correct authoritative resources (books, databases, directories) required to evaluate a specific educational credential. It utilizes the bibliography defined in "Exhibit VII".

## When to Use

Use this skill when the user provides educational credentials or documents and asks for:
* Verification of an institution's accreditation.
* Interpretation of a transcript, grading scale, or credit system.
* Guidance on handling specific country credentials (especially China or North America).
* Authoritative sources to cite in an evaluation report.

## How to Use

To provide the correct references, the Agent must follow these steps:

1.  **Extract Context**: Analyze the user's input to identify key attributes:
    * **Country of Education** (e.g., China, USA, Global).
    * **Degree/Level** (e.g., Bachelor, Master, PhD).
    * **Document Type** (e.g., Transcript, Diploma).
    * **Specific Issue** (e.g., Privacy/FERPA, Grading System).

2.  **Execute Lookup**: Run the provided Python script using the extracted context.
    ```bash
    python scripts/lookup_refs.py --context "<Insert extracted context keywords here>"
    ```

3.  **Generate Response**:
    * Present the **top 3 references** returned by the script.
    * For each reference, clearly state the **Title** and **Edition**.
    * Explain *why* this specific reference is applicable to the user's case (using the "Rationale" provided by the script).
    * (Optional) If the user provided a PDF/Image, mention that these references are used to cross-reference the data found in their file.

## Examples

**User:** "I have a transcript from Peking University for a Bachelor's degree. How do I verify the credits?"

**Agent Action:**
`python scripts/lookup_refs.py --context "China Bachelor Transcript Credits"`

**Agent Response:**
"Based on the AICE bibliography, here are the required references:
1. **Chinese Universities and Colleges**: To verify Peking University's official standing.
2. **AACRAO Academic Record and Transcript Guide**: To interpret the credit hours and grading layout.
3. **International Handbook of Universities**: For global accreditation cross-check."