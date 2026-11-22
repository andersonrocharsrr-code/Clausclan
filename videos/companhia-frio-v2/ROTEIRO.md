# Companhia do Frio — versão 2 (35 s, vertical), no estilo do comercial de referência

Mesma narração e mesmos tempos da versão 1 (`../companhia-frio/narracao.py` e `audio.py`), visual novo:
fundo claro e limpo, letra Bricolage Grotesque grande e escura com palavra em azul, palavras entrando desfocadas,
cartõezinhos de aplicativo (chave liga/desliga, porcentagem, temperatura rolando), telas azuis de impacto
(abertura e gás) e o mascote 3D da empresa. Fotos em `../companhia-frio/fotos/` (logo escura feita para fundo claro).

| Tempo | Cena |
|---|---|
| 0–2,45 | Tela azul: "Seu freezer ou geladeira deu problema?", cartão 12 °C subindo, picolé derretendo |
| 2,45–5,5 | "Chama a Companhia do Frio!", mascote |
| 5,5–11,5 | Adaptação de LED: foto antes → depois, cartão "Iluminação LED" liga |
| 11,5–18,6 | Limpeza do condensador: antes e depois, "Sujeira removida 100 %" |
| 18,6–23,5 | Tela azul: "Recuperação de gás.", manômetros, "Medição na hora" |
| 23,5–29,2 | Troca de compressor: velho sai, novo entra, temperatura desce até −18 °C |
| 29,2–35 | Logo, frase da empresa, 4 serviços ✓, mascote |

Gerar: `node render.js /tmp/v.mp4` e juntar com o áudio da versão 1 (comando no ROTEIRO da versão 1).
