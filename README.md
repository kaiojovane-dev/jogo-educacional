# Patati Patatá — Vamos Aprender Brincando!

> **Versão 1.0: versão de apresentação**
>
> Este é o protótipo usado para apresentar o projeto. **Não é a versão final.** Conteúdo, visual, regras dos jogos e organização do código ainda podem mudar até a versão definitiva.

Plataforma educacional infantil, para crianças em fase de alfabetização, com cinco jogos de leitura e escrita. Tem narração em português (pt-BR) e o progresso fica salvo no próprio navegador. É feita só com HTML, CSS e JavaScript, sem dependências e sem etapa de build.

## Jogos

| # | Jogo | Dificuldade trabalhada | Habilidade principal |
|---|------|------------------------|----------------------|
| 1 | Detetives dos Sons | P/B, T/D, F/V, CH/X | Discriminação fonêmica e correspondência som-letra |
| 2 | O Gato Mebolo | Aglutinação e segmentação | Consciência lexical e segmentação de frases |
| 3 | Construtores de Palavras | Omissões e inversões | Ordem dos fonemas e das sílabas |
| 4 | Aventura do Re G | Regras contextuais (R/RR, G/GU, C/QU) | Ortografia contextual |
| 5 | Missão Palavra Mágica | Consciência fonológica | Integração das habilidades anteriores |

### Regras desta versão

- **Atividades:** cada jogo tem 10.
- **Pontos:** acertar de primeira vale 10 pontos; acertar depois de errar vale 5.
- **Erros:**
  - Jogos 2 a 5: depois de 3 tentativas erradas, a resposta certa é mostrada e a atividade não pontua.
  - Detetives dos Sons: a criança tenta até acertar.
- **Estrelas por jogo,** contando os acertos de primeira:
  - 9 ou mais: 3 estrelas.
  - 5 a 8: 2 estrelas.
  - menos de 5: 1 estrela.
- **Conquistas:** 5 medalhas — Primeira Aventura, Mão na Massa, Sequência Brilhante, Estrelas Completas e Grande Campeão.

## Telas

- **Início:** vídeo de abertura em tela cheia com o botão "Vamos lá!".
- **Jogos:** cartões dos cinco jogos.
- **Conquistas:** estrelas, jogos concluídos, atividades respondidas, melhor sequência e medalhas.
- **Sobre:** objetivo, personagens, jogos e habilidades trabalhadas.

## Como executar

Os arquivos precisam ser servidos por HTTP: se o `index.html` for aberto direto do disco, o vídeo e os áudios podem não carregar. Na raiz do projeto, rode:

```bash
python -m http.server 5517
```

Depois, abra http://localhost:5517. Qualquer servidor estático serve, inclusive o GitHub Pages.

## Limitações conhecidas desta versão

- **Progresso:** fica só no navegador (`localStorage`). Não há contas, servidor nem sincronização entre aparelhos, e limpar os dados do navegador apaga o progresso.
- **Narração:** usa as vozes de síntese do próprio navegador e do sistema, então a voz muda de um aparelho para outro. Sem voz em português instalada, a narração pode sair com outra pronúncia.
- **Testes:** não há testes automatizados no repositório. Os testes desta versão foram feitos à mão, só no Chromium (Chrome e Edge).
- **Navegadores sem WebP:** as imagens têm os originais PNG/JPG como reserva, mas esse caminho não foi testado num navegador real.

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

## Convenções para quem for continuar o projeto

### Imagens

As fotos e os PNGs têm uma cópia `.webp` ao lado do original, que fica como reserva para navegadores sem suporte a WebP. Cada parte do código escolhe o formato de um jeito:

- **HTML:** `<picture>` com `<source type="image/webp">`.
- **CSS:** `image-set()`, logo depois de uma declaração `url()` com o original.
- **JavaScript:** `ppAsset(caminho)`, de `js/core/assets.js`.

Para adicionar uma imagem nova com versão WebP, gere o `.webp` no mesmo diretório e inclua o caminho original em `WEBP_READY`, em `js/core/assets.js`. PNGs com transparência usam WebP sem perda.

### Cache

Os arquivos CSS e JS são referenciados com `?v=AAAAMMDDx` no `index.html`. Ao alterar qualquer um deles, troque essa versão em todas as referências, para que os navegadores baixem o arquivo novo.

### Dados salvos

O progresso fica no `localStorage`, na chave `pp_progress_v1`; as preferências de áudio ficam em `pp_muted` e `pp_volume`. Nenhum dado sai do dispositivo. Se a versão final mudar o formato desses dados, use uma chave nova (por exemplo, `pp_progress_v2`) e migre os dados antigos, como `migrateLegacy()` já faz em `js/core/progress.js`.

## Histórico de versões

| Versão | Descrição |
|--------|-----------|
| 1.0 | Versão de apresentação: cinco jogos, Conquistas e Sobre; otimização de carregamento e organização das pastas. |
