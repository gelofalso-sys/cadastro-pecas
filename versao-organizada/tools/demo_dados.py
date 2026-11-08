"""Anonimiza um Backup completo do app para virar os dados iniciais de uma demo pública.

Uso:  python tools/demo_dados.py <backup.json> <saida.json> [--manter-nomes]

Sempre remove: dados do cliente/comprador dos romaneios (nome, CPF/CNPJ, telefone, e-mail,
endereço, CEP), o telefone do fornecedor no cabeçalho, rascunho de romaneio e relatório.
Por padrão também troca nomes de fornecedores e de galvânicas por nomes genéricos
(--manter-nomes deixa os nomes reais). Preços, custos, fatores e fotos das peças são mantidos.
"""
import json, re, sys

# valor igual a isto (ids internos) -> novo id
IDS = {"scarlat": "galvanicaa", "carlinha": "atacadoexemplo"}
# trecho (sem diferenciar maiúsculas) -> texto genérico
NOMES = [
    ("Clube de Compras da Carlinha Ltda", "Clube de Compras Exemplo Ltda"),
    ("Clube de Compras da Carlinha", "Clube de Compras Exemplo"),
    ("Antonios brutos", "Atacado D brutos"),
    ("Antonios", "Atacado D"),
    ("Spina Joias", "Joias Prontas G"),
    ("Evidência", "Joias Prontas F"),
    ("Evidencia", "Joias Prontas F"),
    ("Xangai", "Atacado A"),
    ("Tucano", "Atacado B"),
    ("Medusa", "Atacado C"),
    ("Rosah", "Atacado E"),
    ("Esplendor", "Verão"),
    ("Scarlat", "Galvânica A"),
    ("Carlinha", "Exemplo"),
]
GALV_EXTRA = {"5078ta10": "Galvânica B"}  # galvânica que tinha nome de categoria


def mascara_texto(t):
    """Cabeçalho do romaneio sem dados pessoais; a lista de itens fica igual."""
    linhas = t.replace("\r\n", "\n").split("\n")
    saida, em_cab = [], True
    for i, l in enumerate(linhas):
        if em_cab and re.match(r"\s*Categoria\b", l):
            em_cab = False
        if not em_cab:
            saida.append(l)
            continue
        if i == 0:
            saida.append("Fornecedor Atacado Exemplo Ltda")
        elif i == 1 and re.search(r"\d{4,5}-\d{4}", l):
            saida.append("(00) 00000-0000")
        elif re.match(r"\s*(Romaneio do Link|Pedido|Data Fechamento)", l, re.I):
            saida.append(re.sub(r"GC-\d+", "GC-00000", l))
        elif re.match(r"\s*Cliente\s*:", l, re.I):
            saida.append("Cliente:   Cliente Exemplo")
        # demais linhas do cabeçalho (CPF/CNPJ, WhatsApp, e-mail, endereço, CEP) são descartadas
    r = "\n".join(saida)
    # rodapé de pagamento (favorecido, PIX, banco, link de cartão): some até "Documento gerado"
    r = re.sub(r"Dados para o pagamento:.*?(?=\n\s*Documento gerado)", "Dados para o pagamento: (omitidos na demo)", r, flags=re.S | re.I)
    r = re.sub(r"https?://\S+", "https://exemplo.com.br/pagamento", r)
    r = re.sub(r"\b\d{11,14}\b", "00000000000", r)
    # rede de segurança em qualquer lugar do texto
    r = re.sub(r"\d{2,3}\.\d{3}\.\d{3}[/-]\d{2,4}-?\d{0,2}", "00.000.000/0000-00", r)
    r = re.sub(r"\(\d{2}\)\s?\d{4,5}-\d{4}", "(00) 00000-0000", r)
    r = re.sub(r"\S+@\S+\.\S+", "cliente@exemplo.com", r)
    r = re.sub(r"CEP:?\s*\d{5}-?\d{3}", "CEP: 00000-000", r)
    return r


def anonimizar(d, manter_nomes=False):
    d = json.loads(json.dumps(d))  # cópia
    for k in ("rascunho", "rel", "form"):  # formulário aberto na hora do backup não faz parte do exemplo
        d.pop(k, None)
    d["autor"] = ""

    def troca(v):
        if isinstance(v, str):
            if v.startswith("data:image"):
                return v
            if not manter_nomes:
                if v in IDS:
                    return IDS[v]
                for a, b in NOMES:
                    v = re.sub(re.escape(a), b, v, flags=re.I)
            return v
        if isinstance(v, list):
            return [troca(x) for x in v]
        if isinstance(v, dict):
            return {k: troca(x) for k, x in v.items()}
        return v

    for r in (d.get("roms") or {}).values():
        if isinstance(r.get("texto"), str):
            r["texto"] = mascara_texto(r["texto"])
        r["doc"] = ""
        r.pop("hash", None)
    d = troca(d)
    if not manter_nomes:
        for b in d["config"].get("banhistas", []):
            if b.get("id") in GALV_EXTRA.keys() or b.get("nome") == "colares":
                b["nome"] = GALV_EXTRA.get(b.get("id"), "Galvânica B")
    return d


def confere(d):
    textos = []

    def colhe(v):  # só textos (números como carimbos de data não contam)
        if isinstance(v, str):
            if not v.startswith("data:image"):
                textos.append(v)
        elif isinstance(v, list):
            [colhe(x) for x in v]
        elif isinstance(v, dict):
            [colhe(x) for x in v.values()]
    colhe(d)
    s = "\n".join(textos)
    ruins = []
    for nome, p in {"cnpj/cpf": r"\d{2,3}\.\d{3}\.\d{3}[/-]\d{2,4}-?\d{0,2}",
                    "fone": r"\(\d{2}\)\s?\d{4,5}-\d{4}", "email": r"\S+@\S+\.\S+",
                    "cep": r"CEP:?\s*\d{5}-?\d{3}", "pix/numero": r"\b\d{11,14}\b",
                    "link": r"https?://(?!i\.ibb\.co/)\S+", "pagamento": r"Pix|Sicredi|favorecid"}.items():
        for m in re.finditer(p, s):
            if m.group(0) not in ("00.000.000/0000-00", "(00) 00000-0000", "cliente@exemplo.com", "CEP: 00000-000", "00000000000", "https://exemplo.com.br/pagamento"):
                ruins.append((nome, m.group(0)))
    return ruins


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    src, dst = args[0], args[1]
    d = json.load(open(src, encoding="utf-8"))
    out = anonimizar(d, "--manter-nomes" in sys.argv)
    ruins = confere(out)
    if ruins:
        sys.exit("AINDA HÁ DADOS PESSOAIS: %r" % ruins[:5])
    json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("ok:", len(out["lanc"]), "peças,", len(out["roms"]), "romaneios,", len(out["fotos"]), "fotos")
