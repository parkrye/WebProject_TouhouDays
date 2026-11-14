// 배포 사이트: 언어 고르기(?lang= → 저장값 → 브라우저 언어) + 페이지 그리기
// 조작법·콘텐츠는 목차 → 주제 페이지(?s=id) 하나씩, 옆 목차와 이전/다음으로 이어짐
// 아이콘은 모두 게임 아틀라스에서 잘라 온 픽셀 그림(img/ic)
(function () {
  const T = window.I18N
  const LANGS = ['ko', 'ja', 'zh', 'en']
  const PAGE = document.body.dataset.page
  const VERSION = document.body.dataset.version || ''
  const RELEASES = 'https://github.com/parkrye/WebProject_TouhouDays/releases/latest'
  const REPO = 'https://github.com/parkrye/WebProject_TouhouDays'
  const SHOTS = ['natsumatsuri', 'hanami', 'yukimatsuri', 'momiji', 'village', 'tsukimi', 'library', 'underground']
  // 콘텐츠 주제마다 곁들일 사진
  const TOPIC_IMG = { start: 'title', day: 'winter', farm: 'farm', craft: 'library', people: 'village', work: 'market', home: 'house', world: 'tengu', fest: 'natsumatsuri', chaos: 'court', sim: 'tanabata', save: 'tsukimi' }
  const CONTROL_IC = { kb: 'e_walk', mouse: 'e_right', touch: 'e_hand', hud: 'e_clock', menu: 'e_gear', tips: 'e_q' }
  const CONTENT_IC = { start: 'i_seed_daikon', day: 'e_sun', farm: 'i_hoe', craft: 'i_workbench', people: 'e_happy', work: 'e_coin', home: 'e_home', world: 'e_map', fest: 'i_chochin', chaos: 'i_hammer', sim: 'e_auto', save: 'e_save' }
  // 메뉴 설명 줄 순서대로 (i18n controls.menu 와 같은 순서)
  const MENU_IC = ['e_save', 'e_map', 'e_camera', 'e_face', 'e_sparkle', 'i_sake', 'i_goban', 'e_home', 'e_export', 'e_import', 'i_scroll', 'e_note']
  const TOUCH_IC = ['e_walk', 'e_hand', 'i_hoe']

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
  const ic = (name, cls) => `<img class="ic${cls ? ' ' + cls : ''}" src="img/ic/${name}.png" alt="" width="32" height="32">`
  const bare = s => s.replace(/[←→]/g, '').trim()

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
      <a class="brand" href="${link('index')}">동방일일담</a>
      <nav class="nav">${nav}<a href="play/">${esc(L.nav.play)}</a></nav>
      <div class="langs" role="group" aria-label="Language">${langs}</div>
    </div>`
  }

  function footer(L) {
    return `<div class="foot-in"><span>${esc(L.footer.notice)}</span>
      ${VERSION ? `<span>v${esc(VERSION)}</span>` : ''}
      <a href="${RELEASES}">${esc(L.footer.releases)}</a>
      <a href="${REPO}">GitHub</a></div>`
  }

  // ------------------------------------------------------------ 홈
  function home(L) {
    const H = L.home
    const shots = SHOTS.map(id => `<figure><img src="img/${id}.webp" alt="${esc(H.caps[id])}" loading="lazy" width="960" height="540"><figcaption>${esc(H.caps[id])}</figcaption></figure>`).join('')
    const bookIc = { controls: 'e_hand', content: 'i_book' }
    const books = H.cards.map(([p, t, d]) => `<a class="sheet book" href="${link(p)}">${ic(bookIc[p], 'l')}<span><h3>${esc(t)}</h3><p>${esc(d)}</p></span></a>`).join('')
    return `
      <section class="stage">
        <img src="img/natsumatsuri.webp" alt="" width="960" height="540">
        <div class="stage-in">
          <div class="logo"><b>동방일일담</b><span>Where the Seasons Rest</span></div>
          <div class="stage-btns">
            <a class="tbtn go" href="play/">${ic('e_walk')}${esc(H.play)}</a>
            <a class="tbtn" href="${RELEASES}">${ic('e_export')}${esc(H.zip)}</a>
          </div>
        </div>
        <span class="stage-cap">${esc(H.caps.natsumatsuri)}</span>
      </section>
      <div class="intro"><p>${esc(H.tag)}</p><p class="facts">${H.facts.map(esc).join(' · ')}${VERSION ? ` · ${esc(H.ver)} ${esc(VERSION)}` : ''}</p></div>
      <h2 class="h">${ic('i_book', 's')}${esc(H.guides)}</h2>
      <div class="books">${books}</div>
      <h2 class="h">${ic('e_camera', 's')}${esc(H.shots)}</h2>
      <div class="gallery">${shots}</div>
      <div class="notice">${H.notice.map(n => `<p>${esc(n)}</p>`).join('')}</div>`
  }

  // ------------------------------------------------------------ 목차 · 주제 페이지 틀
  /** topics: [{ id, icon, h, sum }] */
  function hub(L, page, head, topics) {
    const rows = topics.map(t => `<li><a href="${link(page, t.id)}">${ic(t.icon, 'l')}<span><b>${esc(t.h)}</b><small>${esc(t.sum)}</small></span>${ic('e_right', 's arr')}</a></li>`).join('')
    return `<div class="lead"><h1>${esc(head.h1)}</h1><p>${esc(head.lead)}</p></div>
      <div class="sheet chapters"><ol>${rows}</ol></div>`
  }

  function topicPage(L, page, head, topics, id, body) {
    const i = topics.findIndex(t => t.id === id), t = topics[i]
    const prev = topics[i - 1], next = topics[i + 1]
    const list = topics.map(x => `<li><a href="${link(page, x.id)}"${x.id === id ? ' aria-current="page"' : ''}>${ic(x.icon, 's')}${esc(x.h)}</a></li>`).join('')
    const wide = matchMedia('(min-width: 821px)').matches
    return `<div class="read">
      <aside class="side"><details${wide ? ' open' : ''}><summary>${esc(head.h1)} · ${i + 1} / ${topics.length}</summary>
        <a class="back" href="${link(page)}">${esc(head.h1)}</a><ol>${list}</ol></details></aside>
      <article class="sheet page">
        <p class="crumbs">${esc(head.h1)} · ${i + 1} / ${topics.length}</p>
        <h1>${ic(t.icon, 'l')}${esc(t.h)}</h1>
        ${body}
        <nav class="pager">
          ${prev ? `<a class="prev" href="${link(page, prev.id)}">${ic('e_left', 's')}<span><small>${esc(bare(L.ui.prev))}</small>${esc(prev.h)}</span></a>` : ''}
          ${next ? `<a class="next" href="${link(page, next.id)}"><span><small>${esc(bare(L.ui.next))}</small>${esc(next.h)}</span>${ic('e_right', 's')}</a>` : ''}
        </nav>
      </article></div>`
  }

  // ------------------------------------------------------------ 조작법
  function controlTopics(C) {
    return Object.keys(C.toc).map(id => ({ id, icon: CONTROL_IC[id], h: C.toc[id], sum: C.sum[id] }))
  }

  function controlBody(C, id) {
    const rows = list => list.map(([k, v]) => `<tr><td>${keysHtml(k)}</td><td>${esc(v)}</td></tr>`).join('')
    const legend = list => `<ol class="legend">${list.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`
    const shot = (src, w, h) => `<div class="inline-shot"><img src="img/${src}" alt="" width="${w}" height="${h}"></div>`
    switch (id) {
      case 'kb': return `<table class="keys">${rows(C.kb)}</table><p class="note">${esc(C.kbNote)}</p>${shot('keyhint.png', 232, 146)}`
      case 'mouse': return `<table class="keys">${C.mouse.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`
      case 'touch': return `<div class="touch">${C.touch.map(([, how, what], i) => `<div>${ic(TOUCH_IC[i], 'l')}<b>${esc(how)}</b><br>${esc(what)}</div>`).join('')}</div>
        <ul>${C.touchMore.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
      case 'hud': return `<h3>${esc(C.hudLeft)}</h3>${shot('hud_left.png', 192, 188)}${legend(C.hudLeftList)}
        <h3>${esc(C.hudRight)}</h3>${shot('hud_right.png', 428, 54)}${legend(C.hudRightList)}
        <h3>${esc(C.hudBar)}</h3>${shot('hud_bar.png', 406, 112)}${legend(C.hudBarList)}`
      case 'menu': return `<p class="note">${esc(C.menuH)}</p><ul class="icons">${C.menu.map(([, t], i) => `<li>${ic(MENU_IC[i] || 'e_gear')}<span>${esc(t)}</span></li>`).join('')}</ul>`
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
    const C = L.content, topics = C.sections.map(x => ({ ...x, icon: CONTENT_IC[x.id] })), id = topicOf()
    const s = topics.find(t => t.id === id)
    if (!s) return hub(L, 'content', C, topics)
    const img = TOPIC_IMG[id]
    const body = `${img ? `<figure class="shot"><img src="img/${img}.webp" alt="" width="960" height="540"></figure>` : ''}
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
    const img = e.target.closest && e.target.closest('.gallery img, .shot img')
    if (!img) return
    const z = document.createElement('div'); z.className = 'zoom'
    z.innerHTML = `<img src="${img.src}" alt="${esc(img.alt)}">`
    z.addEventListener('click', () => z.remove())
    document.body.appendChild(z)
  })
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.zoom').forEach(z => z.remove()) })

  render()
})()
