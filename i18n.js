// DevToolKit i18n - Multi-Language Switcher
(function() {
  var STORAGE_KEY = 'devtoolkit-lang';
  var LANGS = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'zh', label: '中文', short: '中' },
    { code: 'ja', label: '日本語', short: '日' },
    { code: 'ko', label: '한국어', short: '한' },
    { code: 'es', label: 'Español', short: 'ES' },
    { code: 'pt', label: 'Português', short: 'PT' },
    { code: 'fr', label: 'Français', short: 'FR' },
  ];

  function detectLang() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS.some(function(l) { return l.code === saved; })) return saved;
    var bl = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (bl.startsWith('zh')) return 'zh';
    if (bl.startsWith('ja')) return 'ja';
    if (bl.startsWith('ko')) return 'ko';
    if (bl.startsWith('es')) return 'es';
    if (bl.startsWith('pt')) return 'pt';
    if (bl.startsWith('fr')) return 'fr';
    return 'en';
  }

  // Save original English text before first translation
  var originals = {};
  function saveOriginals() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (!originals[key]) originals[key] = el.textContent;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (!originals[key]) originals[key] = el.getAttribute('placeholder');
    });
  }

  // Get page ID from URL
  function getPageId() {
    var path = window.location.pathname;
    // Check for inline override
    if (window.I18N_PAGE_ID) return window.I18N_PAGE_ID;
    if (path.indexOf('/tools/') >= 0) {
      var m = path.match(/\/tools\/(.+?)\.html/);
      if (m) return m[1];
    }
    if (path.indexOf('privacy') >= 0) return '_privacy';
    return '_home';
  }

  // Apply translations
  function applyTranslations(lang) {
    var dict;
    // Use shared translations.js if available
    if (window.I18N_ALL && window.I18N_GET) {
      var pageId = getPageId();
      dict = window.I18N_GET(pageId, lang);
    } else if (window.I18N_DICT) {
      // Fallback to inline dict (only has zh)
      dict = lang === 'zh' ? window.I18N_DICT : {};
    } else {
      dict = {};
    }

    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (lang === 'en') {
        if (originals[key]) el.textContent = originals[key];
      } else {
        var text = dict[key];
        if (text) el.textContent = text;
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (lang === 'en') {
        if (originals[key]) el.setAttribute('placeholder', originals[key]);
      } else {
        var text = dict[key];
        if (text) el.setAttribute('placeholder', text);
      }
    });
    // Also update elements with data-i18n-text (used by file-upload.js)
    document.querySelectorAll('[data-i18n-text]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-text');
      var text = dict[key];
      if (text) {
        // Preserve first child if it's an icon span
        var icon = el.querySelector('.upload-icon');
        if (icon) {
          el.innerHTML = '';
          el.appendChild(icon);
          el.appendChild(document.createTextNode(' ' + text));
        } else {
          el.textContent = text;
        }
      }
    });

    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    updateSelector(lang);
  }

  // Build or update language selector
  function updateSelector(lang) {
    var sel = document.getElementById('langSelect');
    if (!sel) return;
    sel.value = lang;
  }

  function buildSelector(currentLang) {
    var existing = document.getElementById('langSelect');
    if (existing) return; // Already built

    var sel = document.createElement('select');
    sel.id = 'langSelect';
    sel.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;font-weight:600;padding:4px 8px;cursor:pointer;margin-left:8px;outline:none;';
    LANGS.forEach(function(l) {
      var opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.short + ' ' + l.label;
      if (l.code === currentLang) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function() {
      applyTranslations(this.value);
    });

    // Replace old toggle button if exists
    var oldBtn = document.getElementById('langToggle');
    if (oldBtn) {
      oldBtn.parentNode.replaceChild(sel, oldBtn);
    } else {
      // Append to nav
      var nav = document.querySelector('.nav');
      if (nav) nav.appendChild(sel);
    }
  }

  // Remove old inline I18N_DICT script tags
  function removeInlineDict() {
    var scripts = document.querySelectorAll('script:not([src])');
    scripts.forEach(function(s) {
      if (s.textContent.indexOf('window.I18N_DICT') >= 0) {
        s.parentNode.removeChild(s);
      }
    });
  }

  // Init
  function init() {
    saveOriginals();
    var lang = detectLang();
    buildSelector(lang);
    removeInlineDict();
    applyTranslations(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
