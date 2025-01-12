# Responses Summary

## Overview

This document outlines the process for exporting and formatting data collected from the `Questionnaire Beer to Beer`. It includes a list of exported files, a description of the main columns, and instructions for future exports and updates.

---

## Exported Files

### File List

- `questionnaire_responses_raw.csv`: Raw data exported directly from the linked Google Sheet.
- `questionnaire_responses_cleaned.csv`: Cleaned data with emojis and formatting removed.

### File Descriptions

1. **`questionnaire_responses_raw.csv`**:
    - This file contains all the raw responses collected from the Google Form. It is exported directly from the linked Google Sheet without any modifications.

2. **`questionnaire_responses_cleaned.csv`**:
    - This file is a processed version of the raw data, where:
        - All emojis and extra formatting have been removed.
        - Data has been trimmed and normalized to plain text.

---

## Column Descriptions

### Main Columns

The following columns are present in the questionnaire response files:

| Column Name                  | Description                                           |
|------------------------------|-------------------------------------------------------|
| **Timestamp**                | Date and time when the response was submitted.        |
| **Email Address**            | Respondent's email address (if provided).             |
| **Consent**                  | Whether the respondent consented to the questionnaire.|
| **Gender**                   | Respondent's gender.                                  |
| **Age Range**                | Respondent's age range.                               |
| **Country**                  | Country of residence.                                 |
| **Region**                   | Specific region within the country.                  |
| **Profession**               | Respondent's current profession.                     |
| **Sector**                   | Sector of activity.                                   |
| **Hobbies**                  | Respondent's listed hobbies or interests.            |
| **Beer Consumption Frequency** | Frequency of beer consumption.                      |
| **Beer Preferences**         | Types of beer preferred by the respondent.            |

---

## Export and Update Instructions

### Export Process

1. Open the Google Sheet linked to the `Questionnaire Beer to Beer` Google Form.
2. Export the responses:
    - Click on **File > Download > Comma-Separated Values (.csv)**.
    - Save the file with the name `questionnaire_responses_raw.csv`.
3. Run the cleaning script to generate the cleaned version:
    - Ensure the script processes all rows and columns.
    - Save the cleaned output as `questionnaire_responses_cleaned.csv`.

### Data Cleaning

- Remove emojis and special characters using the cleaning script.
- Trim extra spaces from all textual data.
- Validate column integrity (ensure all columns contain appropriate data types).

### Future Updates

1. Repeat the export process for any new responses.
2. Append new responses to the existing `questionnaire_responses_raw.csv` file if needed.
3. Re-run the cleaning script to ensure consistency in the `questionnaire_responses_cleaned.csv`.
4. Backup both the raw and cleaned files in the `responses_raw` folder on Google Drive.

---

## Example Data

### Raw Data Example (`questionnaire_responses_raw.csv`)

| Timestamp       | Email Address       | Consent | Gender | Age Range | Country | Region        | Profession | Sector      | Hobbies         | Beer Consumption | Beer Preferences |
|-----------------|--------------------|---------|--------|-----------|---------|---------------|------------|-------------|-----------------|------------------|------------------|
| 2025-01-12 14:30 | <example@email.com> | Yes     | Male   | 25-34     | France  | Alpes-Maritimes | Student    | Technology  | Music, Sports   | Monthly          | IPA, Blonde      |

### Cleaned Data Example (`questionnaire_responses_cleaned.csv`)

| Timestamp       | Email Address       | Consent | Gender | Age Range | Country | Region        | Profession | Sector      | Hobbies         | Beer Consumption | Beer Preferences |
|-----------------|--------------------|---------|--------|-----------|---------|---------------|------------|-------------|-----------------|------------------|------------------|
| 2025-01-12 14:30 | <example@email.com> | Yes     | Male   | 25-34     | France  | Alpes-Maritimes | Student    | Technology  | Music, Sports   | Monthly          | IPA, Blonde      |

---
