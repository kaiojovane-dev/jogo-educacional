/* ==========================================================================
   PATATI PATATÁ — CARREGAMENTO DE IMAGENS
   Arquivo: js/core/assets.js
   Usa a versão .webp das imagens quando o navegador suporta (com o
   .png/.jpg original como reserva) e baixa em segundo plano, depois que a
   página carrega, as imagens das outras telas para a troca ser instantânea.
   ========================================================================== */

(function () {
  // Imagens que têm uma cópia .webp ao lado do arquivo original
  const WEBP_READY = new Set([
    'assets/images/jogos/illust_jogo1.png',
    'assets/images/jogos/illust_jogo2.png',
    'assets/images/jogos/illust_jogo3.png',
    'assets/images/jogos/illust_jogo4.png',
    'assets/images/jogos/illust_jogo5.png',
    'assets/images/personagens/patati_home.png',
    'assets/images/personagens/patata_home.png',
    'assets/images/personagens/patati_avatar_helper.png',
    'assets/images/detetives/vassoura.png',
    'assets/images/detetives/borboleta.jpg',
    'assets/images/detetives/chave.jpg',
    'assets/images/detetives/foguete.jpg',
    'assets/images/detetives/girafa.jpg',
    'assets/images/detetives/tesoura.jpg'
  ]);

  // Fundos das telas (css/base.css); jogos.jpg já é o fundo padrão
  const SCENERY = ['conquistas', 'sobre', 'detetives', 'mebolo', 'construtores', 'aventura', 'missao'];

  // Imagens das telas ocultas no index.html (marcadas com loading="lazy")
  const HIDDEN_VIEW_IMAGES = [
    'assets/images/jogos/illust_jogo1.png',
    'assets/images/jogos/illust_jogo2.png',
    'assets/images/jogos/illust_jogo3.png',
    'assets/images/jogos/illust_jogo4.png',
    'assets/images/jogos/illust_jogo5.png',
    'assets/images/personagens/patati_home.png',
    'assets/images/personagens/patata_home.png',
    'assets/images/personagens/patati_avatar_helper.png'
  ];

  let webp = false;

  // Troca a extensão somente depois de confirmar o suporte a WebP
  function ppAsset(path) {
    return webp && WEBP_READY.has(path) ? path.replace(/\.(png|jpg)$/, '.webp') : path;
  }

  // WebP sem perda com transparência (o formato mais exigente usado aqui)
  const probe = new Image();
  const webpChecked = new Promise((resolve) => {
    probe.onload = () => { webp = probe.width === 1; resolve(); };
    probe.onerror = () => resolve();
  });
  probe.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

  // O CSS usa image-set(... type()) e cai no .jpg onde isso não é suportado
  function sceneryUrl(name) {
    const css = window.CSS && CSS.supports &&
      CSS.supports('background-image', 'image-set(url("a.webp") type("image/webp"))');
    return `assets/images/fundos/${name}.${css ? 'webp' : 'jpg'}`;
  }

  // Referências mantidas para as imagens continuarem no cache em memória
  const warmed = [];
  function warm(url) {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    warmed.push(img);
  }

  function warmUp() {
    webpChecked.then(() => {
      SCENERY.forEach((name) => warm(sceneryUrl(name)));
      HIDDEN_VIEW_IMAGES.forEach((path) => warm(ppAsset(path)));
    });
  }

  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  if (document.readyState === 'complete') idle(warmUp);
  else window.addEventListener('load', () => idle(warmUp), { once: true });

  window.ppAsset = ppAsset;
})();
