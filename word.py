from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT

doc = Document()

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run("برنامه کاری شنبه تا پنج‌شنبه — ۱۰ تا ۱۶")
run.bold = True
run.font.size = Pt(16)

table = doc.add_table(rows=1, cols=4)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.style = "Table Grid"

headers = ["روز", "۱۰–۱۲", "۱۲–۱۴", "۱۴–۱۶"]
for i, h in enumerate(headers):
    cell = table.rows[0].cells[i]
    cell.text = h
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    for p in cell.paragraphs:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.bold = True

rows = [
    ["شنبه", "جلسه شروع هفته + تقسیم Task", "توسعه Milify", "مستندسازی + گزارش پیشرفت"],
    ["یکشنبه", "آماده‌سازی موزیک‌های مجاز", "آپلود + کاور + Metadata", "QA + بررسی پخش"],
    ["دوشنبه", "توسعه Frontend Milify", "توسعه Backend / API", "تست + Bug Fix"],
    ["سه‌شنبه", "تولید سناریو Instagram", "فیلم‌برداری / اجرای محتوا", "تدوین + آماده‌سازی انتشار"],
    ["چهارشنبه", "طراحی Militek", "توسعه سایت Militek", "آماده‌سازی Portfolio"],
    ["پنج‌شنبه", "تکمیل Taskهای باقی‌مانده", "تست نهایی کل سیستم", "Demo + گزارش هفتگی + برنامه هفته بعد"],
]

for row in rows:
    cells = table.add_row().cells
    for i, text in enumerate(row):
        cells[i].text = text
        cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for p in cells[i].paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Set approximate column widths
widths = [Cm(2.2), Cm(5.2), Cm(5.2), Cm(5.2)]
for row in table.rows:
    for cell, width in zip(row.cells, widths):
        cell.width = width

# RTL-like paragraph alignment and Persian-friendly font
for p in doc.paragraphs:
    for r in p.runs:
        r.font.name = "Tahoma"
        r.font.size = Pt(11)

for row in table.rows:
    for cell in row.cells:
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.name = "Tahoma"
                r.font.size = Pt(10)

path = "users/rr.docx"
doc.save(path)
print(path)
