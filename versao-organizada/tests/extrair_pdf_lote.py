"""Extrai texto de linhas para comparação exploratória independente.
Uso: python extrair_pdf_lote.py DIRETORIO SAIDA.json
Requer pdfplumber. O arquivo de saída pode conter dados privados: não compartilhe.
"""
from pathlib import Path
import sys, json, re
import pdfplumber
if len(sys.argv)!=3: raise SystemExit('Uso: python extrair_pdf_lote.py DIRETORIO SAIDA.json')
records=[]
for f in sorted(Path(sys.argv[1]).glob('*-link-*.pdf')):
 try:
  with pdfplumber.open(f) as pdf: text='\n'.join(pg.extract_text() or '' for pg in pdf.pages)
  head=text.find('Categoria Descrição Valor Unitário Quantidade Valor Total');text=text[head:] if head>=0 else ''
  marks=list(re.finditer(r'\[#(\d+)\]',text));expected=[]
  for i,m in enumerate(marks):
   chunk=text[m.end():marks[i+1].start() if i+1<len(marks) else len(text)]
   z=re.search(r'(?<![\d,])([0-9]+)\s+R\$\s*([\d.]+,\d{2})',chunk)
   if z:expected.append([m.group(1),int(z.group(1)),z.group(2)])
  records.append({'name':f.name,'text':text,'expected':expected,'markers':len(marks)})
 except Exception as e: records.append({'name':f.name,'error':str(e)})
Path(sys.argv[2]).write_text(json.dumps(records,ensure_ascii=False),encoding='utf8')
print('Documentos lidos:',len(records),'com códigos:',sum(bool(r.get('markers')) for r in records))
