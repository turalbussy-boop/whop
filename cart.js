/**
 * EforHug kit — shared cart drawer + header/footer, loaded on every page.
 * Cart state lives in localStorage. Prices here are display-only; server.js
 * recomputes the charge from the same catalog.
 */
(function () {
  var STORAGE_KEY = 'eforhug-kit-cart'
  var COLORS = ['Gri', 'Pembe']
  var COLOR_IMG = { Gri: '/gri.webp', Pembe: '/pembe.webp' }
  var PACKS = {
    1: { qty: 1, price: 1849, compare: 3760, label: '1 Adet Isıtmalı Battaniye' },
    2: { qty: 2, price: 3328.2, compare: 7520, label: '2 Adet Isıtmalı Battaniye' },
    3: { qty: 3, price: 4714.95, compare: 11280, label: '3 Adet Isıtmalı Battaniye' },
  }
  var POWERBANK_PRICE = 499
  var POWERBANK_COMPARE = 1499

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { items: [] }
      var parsed = JSON.parse(raw)
      return { items: Array.isArray(parsed.items) ? parsed.items : [] }
    } catch (e) {
      return { items: [] }
    }
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {}
  }

  var state = load()
  var isOpen = false

  function money(n) {
    return (
      Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'TL'
    )
  }
  function lineTotal(line) {
    if (line.type === 'powerbank') return POWERBANK_PRICE * (line.qty || 1)
    var pack = PACKS[line.packQty]
    if (!pack) return 0
    return pack.price + (line.includePowerbank ? POWERBANK_PRICE : 0)
  }
  function orderTotal() {
    return state.items.reduce(function (s, i) {
      return s + lineTotal(i)
    }, 0)
  }
  function cartCount() {
    return state.items.reduce(function (s, i) {
      if (i.type === 'powerbank') return s + (i.qty || 1)
      var pack = PACKS[i.packQty]
      return s + (pack ? pack.qty : 0)
    }, 0)
  }
  function notify() {
    persist()
    render()
  }

  function addBlanket(packQty, colors, includePowerbank) {
    var pack = PACKS[packQty]
    if (!pack) return
    var safe = []
    for (var i = 0; i < pack.qty; i += 1) {
      safe.push(COLORS.indexOf(colors && colors[i]) >= 0 ? colors[i] : 'Gri')
    }
    state.items.push({
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      type: 'blanket',
      packQty: packQty,
      colors: safe,
      includePowerbank: !!includePowerbank,
    })
    isOpen = true
    notify()
  }
  function addPowerbank(qty) {
    var n = Math.max(1, Math.min(3, qty || 1))
    var existing = state.items.find(function (i) {
      return i.type === 'powerbank'
    })
    if (existing) existing.qty = Math.min(3, (existing.qty || 1) + n)
    else state.items.push({ id: 'pb', type: 'powerbank', qty: n })
    isOpen = true
    notify()
  }
  function removeItem(id) {
    state.items = state.items.filter(function (i) {
      return i.id !== id
    })
    notify()
  }
  function open() {
    isOpen = true
    render()
  }
  function close() {
    isOpen = false
    render()
  }

  var SOCIAL =
    '<a href="https://facebook.com" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1Z"/></svg></a>' +
    '<a href="https://instagram.com/eforhug" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>' +
    '<a href="https://tiktok.com" aria-label="TikTok"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M14.5 10.4c-.9-.1-1.7.1-2.4.6V8h-2.2v9.6c0 1.4-1.1 2.2-2.3 2.2-.4 0-.9-.1-1.2-.3l-.3 2.1c.4.2 1 .4 1.6.4 2.3 0 4-1.5 4.1-4V13c.6.7 1.5 1.2 2.6 1.2V12c-.8 0-1.5-.6-1.9-1.6Z"/></svg></a>'

  function headerHTML() {
    return (
      '<div class="eh-ann"><div class="eh-ann-rot" id="eh-ann">' +
      '<div class="eh-ann-item is-on"><img src="/emoji-package.png" alt=""> Ücretsiz Kargo İmkanı!</div>' +
      '<div class="eh-ann-item"><img src="/emoji-heart.png" alt=""> Memnuniyet Garantisi!</div>' +
      '<div class="eh-ann-item"><img src="/emoji-gem.png" alt=""> Lansmana Özel İndirimler!</div>' +
      '</div></div>' +
      '<header style="position:sticky;top:0;z-index:40;background:#fffdfc">' +
      '<div class="eh-bar">' +
      '<button type="button" class="eh-icon-btn" data-menu-open aria-label="Menüyü aç"><span class="material-symbols-outlined">menu</span></button>' +
      '<a href="/" class="eh-logo-wrap"><img src="/logo.avif" alt="EforHug" class="eh-logo"></a>' +
      '<button type="button" class="eh-icon-btn" data-cart-toggle aria-label="Sepet"><span class="material-symbols-outlined">shopping_bag</span><span class="eh-cart-count" data-cart-count>0</span></button>' +
      '</div></header>' +
      '<div class="eh-menu" data-menu hidden><div class="eh-menu-panel">' +
      '<button type="button" class="eh-icon-btn" data-menu-close aria-label="Kapat" style="align-self:flex-end"><span class="material-symbols-outlined">close</span></button>' +
      '<a href="/">Ana sayfa</a><a href="/collections/all">Katalog</a><a href="/pages/contact">Forum</a>' +
      '</div></div>'
    )
  }
  function footerHTML() {
    return (
      '<footer class="eh-footer"><div class="eh-foot">' +
      '<div><p style="margin:0;line-height:1.6;font-size:15px;max-width:340px">EforHug, soğuk günlerde konforu her yere taşımanız için tasarlandı. Evde, dışarıda ve yolculukta sıcak kalmanın pratik yolu.</p>' +
      '<div class="eh-social">' + SOCIAL + '</div></div>' +
      '<div><div style="font-weight:700;margin-bottom:16px">Menü</div><nav>' +
      '<a href="/">Ana sayfa</a><a href="/collections/all">Katalog</a><a href="/pages/contact">Forum</a>' +
      '</nav></div>' +
      '<div><div style="font-weight:700;margin-bottom:12px;font-size:18px">E-postalarımıza abone olun.</div>' +
      '<p style="margin:0 0 16px;font-size:14px">Kayıt ol, fırsatlar ve indirimlerden ilk siz haberdar olun!</p>' +
      '<form data-subscribe class="eh-sub">' +
      '<input type="email" required placeholder="E-posta">' +
      '<button type="submit">Bize Katıl</button></form></div>' +
      '</div><div class="eh-social eh-social-center">' + SOCIAL + '</div>' +
      '<div class="eh-pay-row">' +
      '<img src="https://content.whop.com/payment_methods/visa/icons/card_light.svg" alt="Visa" height="30">' +
      '<img src="https://content.whop.com/payment_methods/mastercard/icons/card_light.svg" alt="Mastercard" height="30">' +
      '<img src="https://content.whop.com/payment_methods/amex/icons/card_light.svg" alt="American Express" height="30">' +
      '</div><p class="eh-copy">© 2026, Mağazam · <a href="/gizlilik-politikasi">Gizlilik politikası</a></p></footer>'
    )
  }

  function ensureRoot() {
    if (document.getElementById('eh-drawer')) return
    var mask = document.createElement('div')
    mask.className = 'eh-drawer-mask'
    mask.id = 'eh-drawer-mask'
    mask.addEventListener('click', close)
    var drawer = document.createElement('aside')
    drawer.className = 'eh-drawer'
    drawer.id = 'eh-drawer'
    drawer.innerHTML =
      '<div class="eh-drawer-head"><span>Sepetiniz</span><button type="button" class="eh-icon-btn" data-cart-close aria-label="Kapat"><span class="material-symbols-outlined">close</span></button></div>' +
      '<div class="eh-drawer-body" id="eh-drawer-body"></div>' +
      '<div class="eh-drawer-foot" id="eh-drawer-foot"></div>'
    document.body.appendChild(mask)
    document.body.appendChild(drawer)
  }

  function render() {
    ensureRoot()
    var countEls = document.querySelectorAll('[data-cart-count]')
    var n = cartCount()
    countEls.forEach(function (el) {
      el.textContent = String(n)
      el.classList.toggle('is-on', n > 0)
    })
    var drawer = document.getElementById('eh-drawer')
    var mask = document.getElementById('eh-drawer-mask')
    if (drawer) drawer.classList.toggle('is-on', isOpen)
    if (mask) mask.classList.toggle('is-on', isOpen)
    document.body.classList.toggle('eh-cart-open', isOpen)

    var body = document.getElementById('eh-drawer-body')
    var foot = document.getElementById('eh-drawer-foot')
    if (!body || !foot) return
    if (state.items.length === 0) {
      body.innerHTML = '<p class="eh-drawer-empty">Sepetin boş.</p>'
      foot.innerHTML =
        '<div class="eh-drawer-total"><span>Toplam</span><span>' +
        money(0) +
        '</span></div><a class="eh-continue" href="/collections/all">Alışverişe Devam Et</a>'
      return
    }
    body.innerHTML = state.items
      .map(function (line) {
        if (line.type === 'powerbank') {
          return (
            '<div class="eh-line"><img src="/powerbank.webp" alt=""><div><h4>EforHug Uyumlu Powerbank</h4><p>Adet ' +
            (line.qty || 1) +
            '</p></div><div><strong>' +
            money(lineTotal(line)) +
            '</strong><button class="eh-line-x" data-remove="' +
            line.id +
            '" aria-label="Kaldır">×</button></div></div>'
          )
        }
        var pack = PACKS[line.packQty]
        var img = COLOR_IMG[line.colors && line.colors[0]] || '/gri.webp'
        var extra = line.includePowerbank ? '<p>+ Powerbank 499.00TL</p>' : '<p>🎁 Powerbank hediye</p>'
        return (
          '<div class="eh-line"><img src="' +
          img +
          '" alt=""><div><h4>' +
          pack.label +
          '</h4><p>' +
          (line.colors || []).join(', ') +
          '</p>' +
          extra +
          '</div><div><strong>' +
          money(lineTotal(line)) +
          '</strong><button class="eh-line-x" data-remove="' +
          line.id +
          '" aria-label="Kaldır">×</button></div></div>'
        )
      })
      .join('')
    foot.innerHTML =
      '<div class="eh-drawer-total"><span>Toplam</span><span>' +
      money(orderTotal()) +
      '</span></div><a class="eh-checkout-btn" href="/odeme">Ödemeye Geç</a><a class="eh-continue" href="/collections/all">Alışverişe Devam Et</a>'
  }

  function bind() {
    document.addEventListener('click', function (event) {
      var t = event.target.closest('[data-cart-toggle], [data-cart-close], [data-menu-open], [data-menu-close], [data-remove]')
      if (!t) return
      if (t.hasAttribute('data-cart-toggle')) {
        event.preventDefault()
        isOpen ? close() : open()
      } else if (t.hasAttribute('data-cart-close')) {
        close()
      } else if (t.hasAttribute('data-menu-open')) {
        var menu = document.querySelector('[data-menu]')
        if (menu) {
          menu.hidden = false
          menu.classList.add('is-on')
        }
      } else if (t.hasAttribute('data-menu-close')) {
        var m = document.querySelector('[data-menu]')
        if (m) {
          m.classList.remove('is-on')
          m.hidden = true
        }
      } else if (t.hasAttribute('data-remove')) {
        removeItem(t.getAttribute('data-remove'))
      }
    })
    document.addEventListener('submit', function (event) {
      var form = event.target.closest('[data-subscribe]')
      if (!form) return
      event.preventDefault()
      var email = (form.querySelector('input[type=email]') || {}).value || ''
      window.location.href = 'mailto:destek@eforhug.com?subject=Abone&body=' + encodeURIComponent(email)
    })
    var menu = document.querySelector('[data-menu]')
    if (menu) {
      menu.addEventListener('click', function (event) {
        if (event.target === menu) {
          menu.classList.remove('is-on')
          menu.hidden = true
        }
      })
    }
  }

  function rotateAnn() {
    var root = document.getElementById('eh-ann')
    if (!root) return
    var items = root.querySelectorAll('.eh-ann-item')
    if (items.length < 2) return
    var i = 0
    window.setInterval(function () {
      items[i].classList.remove('is-on')
      i = (i + 1) % items.length
      items[i].classList.add('is-on')
    }, 2500)
  }

  function injectChrome() {
    var h = document.querySelector('[data-eh-header]')
    if (h) h.outerHTML = headerHTML()
    var f = document.querySelector('[data-eh-footer]')
    if (f) f.outerHTML = footerHTML()
    rotateAnn()
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectChrome()
    bind()
    render()
  })

  window.EforHugCart = {
    PACKS: PACKS,
    COLORS: COLORS,
    COLOR_IMG: COLOR_IMG,
    POWERBANK_PRICE: POWERBANK_PRICE,
    POWERBANK_COMPARE: POWERBANK_COMPARE,
    money: money,
    addBlanket: addBlanket,
    addPowerbank: addPowerbank,
    getItems: function () {
      return state.items.slice()
    },
    orderTotal: orderTotal,
    open: open,
    close: close,
  }
})()
