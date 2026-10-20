# Imersa — conceito visual do app de livros imersivos

Estas telas mostram como o app pode ficar. O app ainda não foi construído: aqui só existem as imagens.
Nele você escreve seus livros e coloca **imagens** e **sons** dentro do texto. A leitura vira uma
experiência: as imagens aparecem e os sons tocam conforme o leitor avança.

| Imagem | O que mostra |
|---|---|
| `imagens/editor.jpg` | **Estúdio de escrita**: capítulos à esquerda, a página em papel no centro com o ambiente da cena, sons marcados no texto, uma ilustração com efeito e o menu `/` para inserir mídia. À direita fica a paisagem sonora, com as camadas e o volume de cada uma. |
| `imagens/leitura.jpg` | **Leitura imersiva**: a ilustração ocupa a tela inteira e a frase que está sendo lida aparece destacada. O trovão toca em "o céu se partiu". Embaixo ficam o player do ambiente e a barra do capítulo com os pontos de imagens, sons e música. |
| `imagens/trilha.jpg` | **Estúdio de trilha**: uma linha do tempo que segue o texto (parágrafos) em vez de segundos, com faixas de imagens, ambiente, clima, efeitos e música. Tem também o painel do som selecionado e a biblioteca de sons, onde dá para gravar ou enviar arquivos. |
| `imagens/celular.jpg` | **No celular**: a estante de livros, a leitura imersiva e o painel "Adicionar à página" para pôr som ou imagem com um toque. |

## Ideias principais
- **Sons presos ao texto**: cada efeito toca quando o leitor chega numa frase, não num tempo fixo.
- **Ambiente por cena**: camadas em loop (chuva, mar, floresta) com entrada suave e volume próprio.
- **Imagens vivas**: tela cheia, zoom lento e troca de ilustração conforme a cena.
- **Ouvir a cena** enquanto escreve, do jeito que o leitor vai sentir.

## Gerar as imagens de novo
As telas estão em `telas.html` (HTML + SVG, com as ilustrações desenhadas em código). Para gerar de novo:

```
node livros/conceito/gerar-imagens.js
```
