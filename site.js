// 배포 사이트: 언어 고르기(?lang= → 저장값 → 브라우저 언어) + 페이지 그리기
// 조작법·콘텐츠는 목록(주제 카드) → 주제 페이지(?s=id) 하나씩, 이전/다음으로 이어짐
(function () {
  const T = window.I18N
  const LANGS = ['ko', 'ja', 'zh', 'en']
  const PAGE = document.body.dataset.page
  const VERSION = document.body.dataset.version || ''
  const RELEASES = 'https://github.com/parkrye/WebProject_TouhouDays/releases/latest'
  const SHOTS = ['natsumatsuri', 'hanami', 'yukimatsuri', 'momiji', 'village', 'tsukimi', 'library', 'underground']
  // 콘텐츠 주제마다 곁들일 사진
  const TOPIC_IMG = { start: 'title', day: 'winter', farm: 'farm', craft: 'library', people: 'village', work: 'market', home: 'house', world: 'tengu', fest: 'natsumatsuri', chaos: 'court', sim: 'tanabata', save: 'tsukimi' }
  const CONTROL_EM = { kb: '⌨️', mouse: '🖱️', touch: '📱', hud: '🧭', menu: '⚙️', tips: '💡' }

  function pickLang() {
    const q = new URLSearchParams(location.search).get('lang')
    if (q && LANGS.includes(q)) { try { localStorage.setItem('td-site-lang', q) } catch (e) { /* 저장 불가 */ } return q }
    try { const s = localStorage.getItem('td-site-lang'); if (s && LANGS.includes(s)) return s } catch (e) { /* 저장 불가 */ }
    for (const l of navigator.languages || [navigator.language || '']) {
      const p = String(l).toLowerCase().slice(0, 2)
      if (LANGS.includes(p)) return p
    }
    return 'en'
  }

  let lang = pickLang()
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const link = (page, s) => page + '.html' + (s ? '?s=' + s : '')
  const topicOf = () => new URLSearchParams(location.search).get('s')
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>'

  /** 'W A S D | ↑ ← ↓ →' → 키 그림 (| = 또는) */
  function keysHtml(spec) {
    return spec.split('|').map(group => group.trim().split(/\s+/).map(k => {
      if (k === '–') return '<span class="or">–</span>'
      const wide = ['Space', 'Enter', 'Tab', 'Esc'].includes(k) ? ' class="wide"' : ''
      return `<kbd${wide}>${esc(k)}</kbd>`
    }).join('')).join('<span class="or">/</span>')
  }

  function header(L) {
    const nav = [['index', L.nav.home], ['controls', L.nav.controls], ['content', L.nav.content]]
      .map(([p, t]) => `<a href="${link(p)}"${p === PAGE ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')
    const langs = LANGS.map(l => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}">${esc(T[l].name)}</button>`).join('')
    return `<div class="top-in">
      <a class="brand" href="${link('index')}"><img src="img/icon-192.png" alt="" width="36" height="36"><b>동방일일담</b></a>
      <nav class="nav">${nav}<a href="play/">${esc(L.nav.play)} ▸</a></nav>
      <div class="langs" role="group" aria-label="Language">${langs}</div>
    </div>`
  }

  function footer(L) {
    return `<span>${esc(L.footer.notice)}</span>
      ${VERSION ? `<span>v${esc(VERSION)}</span>` : ''}
      <a href="${RELEASES}">${esc(L.footer.releases)}</a>
      <a href="#">${esc(L.footer.top)}</a>`
  }

  // ------------------------------------------------------------ 홈
  function home(L) {
    const H = L.home
    const shots = SHOTS.map(id => `<figure><img src="img/${id}.webp" alt="${esc(H.caps[id])}" loading="lazy" width="960" height="540"><figcaption>${esc(H.caps[id])}</figcaption></figure>`).join('')
    const cards = H.cards.map(([p, t, d]) => `<a class="card" href="${link(p)}"><h3>${esc(t)}</h3><p>${esc(d)}</p><span class="go">${esc(H.go)}</span></a>`).join('')
    return `
      <section class="hero">
        <div class="hero-shot"><img src="img/title.webp" alt="" width="960" height="540"></div>
        <div>
          <h1>동방일일담</h1>
          <div class="sub">Where the Seasons Rest</div>
          <p class="tag">${esc(H.tag)}</p>
          <div class="cta">
            <a class="btn" href="play/">${playIcon}${esc(H.play)}</a>
            <a class="btn ghost" href="${RELEASES}">${esc(H.zip)}</a>
          </div>
          <ul class="facts">${H.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
          ${VERSION ? `<div class="ver">${esc(H.ver)} ${esc(VERSION)}</div>` : ''}
        </div>
      </section>
      <h2 class="sec-title">${esc(H.guides)}</h2>
      <div class="cards">${cards}</div>
      <h2 class="sec-title">${esc(H.shots)}</h2>
      <div class="gallery">${shots}</div>
      <div class="notice">${H.notice.map(n => `<p>${esc(n)}</p>`).join('')}</div>`
  }

  // ------------------------------------------------------------ 목록 · 주제 페이지 틀
  /** topics: [{ id, em, h, sum }] */
  function hub(L, page, head, topics) {
    const cards = topics.map((t, i) => `<a class="topic" href="${link(page, t.id)}">
        <span class="num">${i + 1}</span><span class="em">${t.em}</span>
        <span class="tt"><b>${esc(t.h)}</b><small>${esc(t.sum)}</small></span></a>`).join('')
    return `<div class="page-head"><h1>${esc(head.h1)}</h1><p>${esc(head.lead)}</p><p class="pick">${esc(L.ui.pick)}</p></div>
      <div class="topics">${cards}</div>`
  }

  function topicPage(L, page, head, topics, id, body) {
    const i = topics.findIndex(t => t.id === id), t = topics[i]
    const prev = topics[i - 1], next = topics[i + 1]
    const chips = topics.map(x => `<li><a href="${link(page, x.id)}"${x.id === id ? ' aria-current="page"' : ''}>${x.em} ${esc(x.h)}</a></li>`).join('')
    return `<nav class="crumb"><a href="${link(page)}">${esc(head.h1)}</a><span>›</span><b>${esc(t.h)}</b><span class="count">${i + 1} / ${topics.length}</span></nav>
      <section class="block topic-body" id="${id}"><h2><span class="em">${t.em}</span>${esc(t.h)}</h2>${body}</section>
      <nav class="pager">
        ${prev ? `<a class="prev" href="${link(page, prev.id)}"><small>${esc(L.ui.prev)}</small><b>${prev.em} ${esc(prev.h)}</b></a>` : '<span></span>'}
        <a class="all" href="${link(page)}">${esc(L.ui.all)}</a>
        ${next ? `<a class="next" href="${link(page, next.id)}"><small>${esc(L.ui.next)}</small><b>${next.em} ${esc(next.h)}</b></a>` : '<span></span>'}
      </nav>
      <ul class="toc small">${chips}</ul>`
  }

  // ------------------------------------------------------------ 조작법
  function controlTopics(C) {
    return Object.keys(C.toc).map(id => ({ id, em: CONTROL_EM[id], h: C.toc[id], sum: C.sum[id] }))
  }

  function controlBody(C, id) {
    const rows = list => list.map(([k, v]) => `<tr><td>${keysHtml(k)}</td><td>${esc(v)}</td></tr>`).join('')
    const legend = list => `<ol class="legend">${list.map((x, i) => `<li><b>${i + 1}</b>${esc(x)}</li>`).join('')}</ol>`
    switch (id) {
      case 'kb': return `<table class="keys">${rows(C.kb)}</table>
        <div class="tip">${esc(C.kbNote)}</div>
        <div class="shot" style="margin-top:12px"><img src="img/keyhint.png" alt="" width="232" height="146"></div>`
      case 'mouse': return `<table class="keys">${C.mouse.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`
      case 'touch': return `<div class="touch">${C.touch.map(([ic, how, what]) => `<div class="t"><div class="ic">${ic}</div><p><b>${esc(how)}</b><br>${esc(what)}</p></div>`).join('')}</div>
        <ul style="margin-top:14px">${C.touchMore.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
      case 'hud': return `<h3>${esc(C.hudLeft)}</h3>
        <div class="hud-grid"><div class="shot"><img src="img/hud_left.png" alt="" width="192" height="188"></div>${legend(C.hudLeftList)}</div>
        <h3>${esc(C.hudRight)}</h3>
        <div class="shot"><img src="img/hud_right.png" alt="" width="428" height="54"></div>${legend(C.hudRightList)}
        <h3>${esc(C.hudBar)}</h3>
        <div class="shot"><img src="img/hud_bar.png" alt="" width="406" height="112"></div>${legend(C.hudBarList)}`
      case 'menu': return `<p class="note">${esc(C.menuH)}</p><ul class="icons">${C.menu.map(([ic, t]) => `<li><span class="ic">${ic}</span><span>${esc(t)}</span></li>`).join('')}</ul>`
      case 'tips': return `<ul>${C.tips.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
    }
    return ''
  }

  function controls(L) {
    const C = L.controls, topics = controlTopics(C), id = topicOf()
    if (!topics.some(t => t.id === id)) return hub(L, 'controls', C, topics)
    return topicPage(L, 'controls', C, topics, id, controlBody(C, id))
  }

  // ------------------------------------------------------------ 콘텐츠
  function content(L) {
    const C = L.content, topics = C.sections, id = topicOf()
    const s = topics.find(t => t.id === id)
    if (!s) return hub(L, 'content', C, topics)
    const img = TOPIC_IMG[id]
    const body = `${img ? `<figure class="topic-shot"><img src="img/${img}.webp" alt="" width="960" height="540"></figure>` : ''}
      ${(s.p || []).map(x => `<p>${esc(x)}</p>`).join('')}
      ${s.list ? `<ul>${s.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`
    return topicPage(L, 'content', C, topics, id, body)
  }

  function render() {
    const L = T[lang]
    document.documentElement.lang = L.htmlLang
    const id = topicOf()
    let title = PAGE === 'index' ? L.home.docTitle : L[PAGE].docTitle
    if (PAGE === 'controls' && L.controls.toc[id]) title = L.controls.toc[id] + ' · ' + title
    if (PAGE === 'content') { const s = L.content.sections.find(x => x.id === id); if (s) title = s.h + ' · ' + title }
    document.title = title
    document.querySelector('header.top').innerHTML = header(L)
    document.querySelector('main').innerHTML = PAGE === 'index' ? home(L) : PAGE === 'controls' ? controls(L) : content(L)
    document.querySelector('footer').innerHTML = footer(L)
    for (const b of document.querySelectorAll('.langs button')) b.addEventListener('click', () => {
      lang = b.dataset.lang
      try { localStorage.setItem('td-site-lang', lang) } catch (e) { /* 저장 불가 */ }
      const u = new URL(location.href); u.searchParams.set('lang', lang); history.replaceState(null, '', u)
      render()
    })
  }

  // 사진 크게 보기
  document.addEventListener('click', e => {
    const img = e.target.closest && e.target.closest('.gallery img, .topic-shot img')
    if (!img) return
    const z = document.createElement('div'); z.className = 'zoom'
    z.innerHTML = `<img src="${img.src}" alt="${esc(img.alt)}">`
    z.addEventListener('click', () => z.remove())
    document.body.appendChild(z)
  })
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.zoom').forEach(z => z.remove()) })

  render()
})()
