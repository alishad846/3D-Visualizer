from pathlib import Path
import zipfile
import csv

public = Path('client/public')
public.mkdir(parents=True, exist_ok=True)
rows = [
    [
        'NOTE: thumbnail_url - single storage URL only. If multiple provided, only the first was used. '
        'gallery_urls - comma-separated storage URLs, maximum 5. If more than 5 provided, only the first 5 are used. '
        'Both columns require pre-uploaded Supabase storage URLs. External URLs will be rejected.'
    ],
    ['name', 'category', 'brand', 'sku', 'tagline', 'description', 'price', 'currency', 'buy_url', 'qr_label', 'usdz_url', 'thumbnail_url', 'gallery_urls'],
]
max_cols = max((len(row) for row in rows), default=0)
cols = [chr(ord('A') + i) for i in range(max_cols)]
sheet_rows = ''
for r, row in enumerate(rows, start=1):
    cells = ''.join([
        f'<c r="{cols[c]}{r}" t="inlineStr"><is><t>{str(v)}</t></is></c>'
        for c, v in enumerate(row)
    ])
    sheet_rows += f'<row r="{r}">{cells}</row>'

content_types = '''<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>'''

rels = '''<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>'''

workbook = '''<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Products" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>'''

workbook_rels = '''<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>'''

sheet = f'''<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData>{sheet_rows}</sheetData>
</worksheet>'''

out = public / 'sample-product-import.xlsx'
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('[Content_Types].xml', content_types)
    z.writestr('_rels/.rels', rels)
    z.writestr('xl/workbook.xml', workbook)
    z.writestr('xl/_rels/workbook.xml.rels', workbook_rels)
    z.writestr('xl/worksheets/sheet1.xml', sheet)

csv_out = public / 'sample-product-import.csv'
with csv_out.open('w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    for row in rows:
        writer.writerow(row)

print(f'Created {out}')
print(f'Created {csv_out}')
