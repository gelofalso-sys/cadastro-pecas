"""Comprime as fotos da pasta INSTAGRAM para publicar no Netlify.

Uso: python tools/comprimir_fotos.py
Gera publicar-netlify-com-fotos/fotos/<pasta>/*.jpg e fotos/manifest.json.
Lado maior limitado a 1620 px (acima do 1350 px que o Instagram usa), JPEG q85 progressivo.
Foto que ja e menor que o resultado e copiada sem recomprimir.
"""
import json, os, shutil
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageOps

ORIGEM = r'C:\Users\mathe\OneDrive\Imagens\INSTAGRAM'
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, 'publicar-netlify-com-fotos', 'fotos')
LADO = 1620
Q = 85


def um(args):
    src, dst = args
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    if max(im.size) > LADO:
        im.thumbnail((LADO, LADO), Image.LANCZOS)
    if im.mode != 'RGB':
        im = im.convert('RGB')
    im.save(dst, 'JPEG', quality=Q, optimize=True, progressive=True)
    if os.path.getsize(dst) >= os.path.getsize(src):
        shutil.copyfile(src, dst)
    return im.size


def main():
    tarefas, manifest = [], {}
    for pasta in sorted(os.listdir(ORIGEM)):
        p = os.path.join(ORIGEM, pasta)
        if not os.path.isdir(p):
            continue
        nomes = sorted(n for n in os.listdir(p) if n.lower().endswith(('.jpg', '.jpeg')))
        manifest[pasta] = nomes
        for n in nomes:
            tarefas.append((os.path.join(p, n), os.path.join(DESTINO, pasta, n)))
    with ProcessPoolExecutor() as ex:
        for i, _ in enumerate(ex.map(um, tarefas, chunksize=8), 1):
            if i % 200 == 0:
                print(i, '/', len(tarefas), flush=True)
    with open(os.path.join(DESTINO, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    tot = sum(os.path.getsize(d) for _, d in tarefas)
    print('feito:', len(tarefas), 'fotos,', round(tot / 1048576, 1), 'MB')


if __name__ == '__main__':
    main()
