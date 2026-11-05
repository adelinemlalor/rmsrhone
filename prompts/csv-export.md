# Prompts — Feature 9: CSV export

Agent: Claude Code (Opus 5.5), branch `feature/csv-export`

## Prompt
> Feature 9 from PLAN.md: an "Export CSV" button on the trip header, next to Export .ics and Export PDF, that downloads every plan in the trip as a spreadsheet. Columns: date, start, end, title, category, status, location, address, city, confirmation #, booked with, estimated and actual cost, currency, paid, notes. Sort by date and time with unscheduled plans last. Escape commas, quotes and line breaks properly so Google Sheets and Excel read it. Name the file after the trip. Unit-test the CSV builder.

## How it was checked without downloading anything
The agent temporarily intercepted `URL.createObjectURL` and the anchor `click()` in the page. It read the generated CSV text straight from the Blob, so nothing was saved to disk.
