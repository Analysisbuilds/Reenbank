// NEW FILE: shared localStorage layer. Load it BEFORE script.js / dashboard.js / profile.js on every page.
const ReenStore = (() => {
  const K = {
    user: 'reen_user',
    accounts: 'reen_accounts',
    extra: 'reen_extra_accounts',
    tx: 'reen_transactions',
    notif: 'reen_notifications',
    unread: 'reen_notif_unread',
    image: 'reen_user_image'
  };

  const DEFAULT_ACCOUNTS = { 'Main Account': 0, 'Savings': 0, 'Plan': 0 };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8">' +
    '<rect width="24" height="24" fill="#e2e8f0" stroke="none"/><circle cx="12" cy="9" r="4"/>' +
    '<path stroke-linecap="round" d="M4 22a8 8 0 0116 0"/></svg>'
  );

  const read = (key, fallback) => {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v === null || v === undefined ? fallback : v;
    } catch (e) {
      return fallback;
    }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (ts, style) => {
    const d = new Date(ts);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return style === 'dots'
      ? `${pad(d.getDate())}.${MON[d.getMonth()]}.${d.getFullYear()} - ${time}`
      : `${pad(d.getDate())} ${MON[d.getMonth()]} ${d.getFullYear()} - ${time}`;
  };

  const generateAccountNumber = () => {
    let n = String(1 + Math.floor(Math.random() * 9));
    for (let i = 0; i < 9; i++) n += Math.floor(Math.random() * 10);
    return n;
  };

  const getUser = () => read(K.user, null);

  const requireUser = () => {
    if (!getUser()) {
      window.location.replace('login.html');
      return false;
    }
    return true;
  };

  const getAccounts = () => ({ ...DEFAULT_ACCOUNTS, ...read(K.accounts, {}) });
  const saveAccounts = (a) => write(K.accounts, a);
  const getTotal = () => Object.values(getAccounts()).reduce((s, v) => s + (Number(v) || 0), 0);

  const getExtra = () => read(K.extra, []);
  const addExtra = (name, desc) => {
    const extra = getExtra();
    extra.push({ name, desc });
    write(K.extra, extra);
    const accounts = getAccounts();
    accounts[name] = 0;
    saveAccounts(accounts);
  };

  const getTransactions = () => read(K.tx, []);
  const addTransaction = (tx) => {
    const list = getTransactions();
    list.unshift({ ...tx, ts: Date.now() });
    write(K.tx, list);
  };

  const getNotifications = () => read(K.notif, []);
  const addNotification = ({ before, amount = null, after = '', tone = 'credit' }) => {
    const list = getNotifications();
    list.unshift({ before, amount, after, tone, ts: Date.now() });
    write(K.notif, list.slice(0, 50));
    localStorage.setItem(K.unread, 'true');
  };

  const updateBadges = () => {
    const unread = localStorage.getItem(K.unread) === 'true';
    document.querySelectorAll('#notification-btn, #notification-btn-mobile').forEach((btn) => {
      btn.querySelector('.bg-red-500')?.classList.toggle('hidden', !unread);
    });
  };

  const markRead = () => {
    localStorage.setItem(K.unread, 'false');
    updateBadges();
  };

  const renderNotifications = () => {
    const list = getNotifications();
    document.querySelectorAll('#notification-dropdown, #notification-dropdown-mobile').forEach((dd) => {
      const box = dd.querySelector('.text-xs');
      if (!box) return;
      box.style.maxHeight = '16rem';
      box.style.overflowY = 'auto';
      if (!list.length) {
        box.innerHTML = '<p class="text-slate-400">No notifications yet</p>';
        return;
      }
      box.innerHTML = list.map((n, i) => {
        const amountHtml = n.amount !== null && n.amount !== undefined
          ? ` <strong class="${n.tone === 'credit' ? 'text-[#34be82]' : 'text-red-500'}">₦ ${Number(n.amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong> `
          : ' ';
        const border = i < list.length - 1 ? 'pb-2.5 border-b border-slate-200/80 ' : '';
        return `<div class="${border}flex items-center justify-between"><span>${esc(n.before)}${amountHtml}${esc(n.after)}</span></div>`;
      }).join('');
    });
    updateBadges();
  };

  const getImage = () => localStorage.getItem(K.image) || AVATAR;
  const setImage = (dataUrl) => {
    try {
      localStorage.setItem(K.image, dataUrl);
      return true;
    } catch (e) {
      return false;
    }
  };

  const applyAvatar = () => {
    const src = getImage();
    document.querySelectorAll('#profile-image-display, #header-avatar, img[alt="User Profile"], img[alt="Profile"]').forEach((img) => {
      img.src = src;
    });
  };

  const applyUser = () => {
    const user = getUser();
    if (!user) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const tag = node.parentElement && node.parentElement.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE') return;
      const t = node.nodeValue.trim();
      if (t === 'Akanmu Qodri') node.nodeValue = node.nodeValue.replace('Akanmu Qodri', user.name);
      else if (t === '1234567890') node.nodeValue = node.nodeValue.replace('1234567890', user.accountNumber);
    });
    document.querySelectorAll('[data-user-name]').forEach((el) => { el.textContent = user.name; });
    document.querySelectorAll('[data-user-email]').forEach((el) => { el.textContent = user.email; });
    document.querySelectorAll('[data-account-number]').forEach((el) => { el.textContent = user.accountNumber; });
  };

  const registerUser = ({ name, email, password }) => {
    [K.accounts, K.extra, K.tx, K.notif, K.unread, K.image, 'reen_user_phone', 'reen_user_gender']
      .forEach((k) => localStorage.removeItem(k));
    const accountNumber = generateAccountNumber();
    write(K.user, { name, email, password, accountNumber });
    saveAccounts({ ...DEFAULT_ACCOUNTS });
    write(K.tx, []);
    write(K.notif, []);
    addNotification({ before: 'Thank you for joining Reen Bank, your trusted and leading bank in Nigeria.' });
    return accountNumber;
  };

  return {
    AVATAR, esc, fmt, formatDate, getUser, requireUser, registerUser,
    getAccounts, saveAccounts, getTotal, getExtra, addExtra,
    getTransactions, addTransaction,
    addNotification, renderNotifications, markRead, updateBadges,
    getImage, setImage, applyAvatar, applyUser
  };
})();