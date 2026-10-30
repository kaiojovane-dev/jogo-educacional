# Patati Patatá — Vamos Aprender Brincando!

Plataforma educacional infantil com cinco jogos de leitura e escrita, narração em português (pt-BR) e progresso salvo no próprio navegador. Feita só com HTML, CSS e JavaScript, sem dependências nem etapa de build.

## Jogos

| # | Jogo | Habilidade trabalhada |
|---|------|-----------------------|
| 1 | Detetives dos Sons | Discriminação fonêmica (P/B, T/D, F/V, CH/X) |
| 2 | O Gato Mebolo | Consciência lexical e segmentação de frases |
| 3 | Construtores de Palavras | Ordem dos fonemas e das sílabas |
| 4 | Aventura do Re G | Ortografia contextual (R/RR, G/GU, C/QU) |
| 5 | Missão Palavra Mágica | Integração das habilidades anteriores |

## Como executar

Os arquivos precisam ser servidos por HTTP: abrindo o `index.html` direto do disco, o vídeo e os áudios podem não carregar. Na raiz do projeto, rode:

```bash
python -m http.server 5517
```

Depois, abra http://localhost:5517. Qualquer servidor estático serve, inclusive o GitHub Pages.

## Estrutura

```
.
├── index.html                 Página única com todas as telas
├── css/                       Carregados por <link>, nesta ordem (a cascata depende dela)
│   ├── variables.css          Tokens: cores, tipografia, raios, sombras, z-index
│   ├── base.css               Reset, escala fluida e fundos de cada tela
│   ├── components.css         Cabeçalho, logo, tela Jogos (cartões), botões e painéis
│   ├── games.css              Cabeçalho dos jogos e Detetives dos Sons
│   ├── animations.css         Keyframes compartilhados
│   ├── platform.css           Botões 3D, estrelas, resultado, avisos, transições, movimento reduzido
│   ├── game-shell.css         Moldura comum dos jogos 2 a 5
│   ├── game-mebolo.css        O Gato Mebolo
│   ├── game-construtores.css  Construtores de Palavras
│   ├── game-aventura.css      Aventura do Re G
│   ├── game-missao.css        Missão Palavra Mágica
│   ├── pages.css              Páginas Conquistas e Sobre
│   └── home.css               Cabeçalho fixo e Tela Início (sempre por último)
├── js/
│   ├── core/                  Módulos compartilhados (carregados primeiro)
│   │   ├── assets.js          Escolha WebP/original e pré-carregamento em segundo plano
│   │   ├── progress.js        Progresso, estrelas e conquistas (localStorage)
│   │   ├── audio.js           Efeitos sonoros e narração (SpeechSynthesis)
│   │   ├── components.js      Estrelas, confetes, avisos, som de clique
│   │   └── gameBase.js        Classe base dos jogos 2 a 5
│   ├── games/                 Um arquivo por jogo
│   ├── pages/conquistas.js    Página Minhas Conquistas
│   └── app.js                 Navegação entre telas (carregado por último)
└── assets/
    ├── audio/                 Efeitos sonoros (.wav)
    ├── video/abertura.mp4     Vídeo da Tela Início
    └── images/
        ├── avatar/            Avatar do jogador e estrela
        ├── personagens/       Patati, Patatá e Gato Mebolo
        ├── jogos/             Ilustrações dos cartões dos jogos
        ├── fundos/            Cenário de cada tela
        ├── detetives/         Figuras do Detetives dos Sons
        └── construtores/      Figuras do Construtores de Palavras
```

## Imagens

As fotos e os PNGs têm uma cópia `.webp` ao lado do arquivo original, que fica como reserva para navegadores sem suporte a WebP:

- **No HTML:** `<picture>` com `<source type="image/webp">`.
- **No CSS:** `image-set()`, depois de uma declaração `url()` com o original.
- **No JavaScript:** `ppAsset(caminho)`, de `js/core/assets.js`.

Para adicionar uma imagem nova com versão WebP, gere o `.webp` no mesmo diretório e inclua o caminho original em `WEBP_READY`, em `js/core/assets.js`. PNGs com transparência usam WebP sem perda.

## Cache

Os arquivos CSS e JS são referenciados com `?v=AAAAMMDDx` no `index.html`. Ao alterar qualquer um deles, troque essa versão em todas as referências, para que os navegadores baixem o arquivo novo.

## Dados salvos

O progresso fica no `localStorage` do navegador, na chave `pp_progress_v1`; as preferências de áudio ficam em `pp_muted` e `pp_volume`. Nenhum dado sai do dispositivo.
