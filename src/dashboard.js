document.addEventListener('DOMContentLoaded', () => {
  // CHANGED: guard + shared data
  if (!ReenStore.requireUser()) return;
  ReenStore.applyUser();
  ReenStore.applyAvatar();
  ReenStore.renderNotifications();

  // Initialize Feather Icons
  if (window.feather) {
    feather.replace();
  }

  // notifications
  const notificationBtn = document.getElementById('notification-btn');
  const notificationDropdown = document.getElementById('notification-dropdown');

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('hidden');
      ReenStore.markRead(); // CHANGED
      closeOtherDropdowns(notificationDropdown);
    });
  }

  // notifications on mobile 
  const notificationBtnMobile = document.getElementById('notification-btn-mobile');
  const notificationDropdownMobile = document.getElementById('notification-dropdown-mobile');

  if (notificationBtnMobile && notificationDropdownMobile) {
    notificationBtnMobile.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdownMobile.classList.toggle('hidden');
      ReenStore.markRead(); // CHANGED
      closeOtherDropdowns(notificationDropdownMobile);
    });
  }

  // CHANGED: period helpers (current year, last 3 months)
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthRange = (offset) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59, 999);
    return { start: start.getTime(), end: end.getTime(), s: start, e: end };
  };
  const rangeLabel = (r) => `${MONTHS_SHORT[r.s.getMonth()]} 1 - ${MONTHS_SHORT[r.e.getMonth()]} ${r.e.getDate()}, ${r.e.getFullYear()}`;
  const totalsFor = (range) => {
    let income = 0;
    let expense = 0;
    ReenStore.getTransactions().forEach((tx) => {
      if (tx.status !== 'Completed' || tx.ts < range.start || tx.ts > range.end) return;
      if (tx.amount > 0) income += tx.amount;
      else expense += Math.abs(tx.amount);
    });
    return { income, expense };
  };

  let dateOffset = 0;
  let statsOffset = 0;
  let balancesVisible = false;

  // date dropdown
  const dateBtn = document.getElementById('date-dropdown-btn');
  const dateMenu = document.getElementById('date-dropdown-menu');
  const dateChevron = document.getElementById('date-chevron');
  const selectedDateText = document.getElementById('selected-date-text');
  const dateOptions = document.querySelectorAll('.date-option');

  if (dateBtn && dateMenu) {
    if (selectedDateText) selectedDateText.textContent = rangeLabel(monthRange(0)); // CHANGED

    dateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dateMenu.classList.toggle('hidden');
      if (dateChevron) {
        dateChevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      }
      closeOtherDropdowns(dateMenu);
    });

    dateOptions.forEach((option, i) => {
      option.textContent = rangeLabel(monthRange(i)); // CHANGED
      option.addEventListener('click', () => {
        selectedDateText.textContent = option.textContent.trim();
        dateMenu.classList.add('hidden');
        if (dateChevron) dateChevron.style.transform = 'rotate(0deg)';
        dateOffset = i; // CHANGED
        renderOverview(); // CHANGED
      });
    });
  }

  // statistics dropdown
  const statsBtn = document.getElementById('stats-dropdown-btn');
  const statsMenu = document.getElementById('stats-dropdown-menu');
  const statsChevron = document.getElementById('stats-chevron');
  const selectedStatsText = document.getElementById('selected-stats-text');
  const statsOptions = document.querySelectorAll('.stats-option');

  if (statsBtn && statsMenu) {
    statsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = statsMenu.classList.toggle('hidden');
      if (statsChevron) {
        statsChevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      }
      closeOtherDropdowns(statsMenu);
    });

    statsOptions.forEach((option, i) => {
      option.textContent = i === 0 ? 'This Month' : MONTHS_FULL[monthRange(i).s.getMonth()]; // CHANGED
      option.addEventListener('click', () => {
        selectedStatsText.textContent = option.textContent.trim();
        statsMenu.classList.add('hidden');
        if (statsChevron) statsChevron.style.transform = 'rotate(0deg)';
        statsOffset = i; // CHANGED
        renderStats(); // CHANGED
      });
    });
  }

  // CHANGED: overview rendering from localStorage
  const ensureExtraAccountCards = () => {
    const balEls = [...document.querySelectorAll('.balance-text')];
    const labels = balEls.map((el) => el.previousElementSibling?.textContent.trim());
    const mainEl = balEls[labels.indexOf('Main Account')];
    if (!mainEl) return;
    const grid = mainEl.parentElement.parentElement;
    ReenStore.getExtra().forEach(({ name }) => {
      if (labels.includes(name)) return;
      const card = document.createElement('div');
      card.className = 'bg-[#D8F3E5] p-4 rounded-2xl space-y-1';
      card.innerHTML = `<p class="text-[10px] font-semibold text-[#46237A]">${ReenStore.esc(name)}</p><p class="text-sm font-bold text-slate-900 balance-text">*****</p>`;
      grid.appendChild(card);
    });
  };

  const renderBalances = () => {
    const accounts = ReenStore.getAccounts();
    const totals = totalsFor(monthRange(dateOffset));
    document.querySelectorAll('.balance-text').forEach((el) => {
      const label = el.previousElementSibling?.textContent.trim();
      let value = null;
      if (label === 'Current Balance') value = ReenStore.getTotal();
      else if (label === 'Income') value = totals.income;
      else if (label === 'Expense') value = totals.expense;
      else if (label in accounts) value = accounts[label];
      if (value === null) return;
      el.textContent = balancesVisible ? `₦ ${ReenStore.fmt(value)}` : '*****';
    });
  };

  const renderStats = () => {
    const t = totalsFor(monthRange(statsOffset));
    const max = Math.max(t.income, t.expense);
    [['Income', t.income], ['Expense', t.expense]].forEach(([label, value]) => {
      const span = [...document.querySelectorAll('span.font-semibold.text-slate-700')].find((s) => s.textContent.trim() === label);
      const row = span?.closest('.justify-between');
      if (!row) return;
      row.querySelector('.h-full').style.width = max ? `${Math.round((value / max) * 100)}%` : '0%';
      row.querySelector('.text-right').textContent = `₦ ${ReenStore.fmt(value)}`;
    });
  };

  const renderOverviewTransactions = () => {
    const list = document.querySelector('#transactions-panel .overflow-y-auto');
    if (!list) return;
    const txs = ReenStore.getTransactions();
    if (!txs.length) {
      list.innerHTML = '<p class="text-center text-slate-400" style="padding:1rem 0">No transaction yet</p>';
      return;
    }
    list.innerHTML = txs.map((tx) => {
      const positive = tx.amount > 0;
      return `
        <div class="flex items-center justify-between py-1.5 border-b border-slate-200/40">
          <div>
            <p class="font-semibold text-slate-700">${ReenStore.esc(tx.name)}</p>
            <p class="text-[10px] text-slate-400">${ReenStore.formatDate(tx.ts, 'dots')}</p>
          </div>
          <span class="font-bold ${positive ? 'text-[#34be82]' : 'text-red-500'}">${positive ? '+' : '- '}${ReenStore.fmt(Math.abs(tx.amount))}</span>
        </div>`;
    }).join('');
  };

  function renderOverview() {
    if (!document.getElementById('transactions-panel')) return;
    ensureExtraAccountCards();
    renderBalances();
    renderStats();
    renderOverviewTransactions();
  }

  //  eye toggle on dashboard
const toggleBalanceBtn = document.getElementById('toggle-balance-btn');
const eyeIcon = document.getElementById('eye-icon');
const eyeOffIcon = document.getElementById('eye-off-icon');

if (toggleBalanceBtn) {
    eyeIcon.classList.remove('hidden'); // CHANGED: balances hidden by default
    eyeOffIcon.classList.add('hidden');

    toggleBalanceBtn.addEventListener('click', () => {
        balancesVisible = !balancesVisible;

        // Toggle the visibility icons
        if (balancesVisible) {
            eyeIcon.classList.add('hidden');
            eyeOffIcon.classList.remove('hidden');
        } else {
            eyeIcon.classList.remove('hidden');
            eyeOffIcon.classList.add('hidden');
        }

        renderBalances(); // CHANGED
    });
}

  // CHANGED: + button leads to Accounts page
  document.querySelector('button[aria-label="Add Account"]')?.addEventListener('click', () => {
    window.location.href = 'accounts.html';
  });

  renderOverview(); // CHANGED

  // Mobile trnx panel
  const navTransactionsBtn = document.getElementById('nav-transactions');
  const transactionsPanel = document.getElementById('transactions-panel');

  if (navTransactionsBtn && transactionsPanel) {
    navTransactionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // On mobile, toggle eys of transaction 
      if (window.innerWidth < 1024) {
        transactionsPanel.classList.toggle('hidden');
        transactionsPanel.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // outside 2 close open dropdown
  document.addEventListener('click', () => {
    closeOtherDropdowns(null);
  });

  function closeOtherDropdowns(currentDropdown) {
    const allDropdowns = [
      { element: notificationDropdown, chevron: null },
      { element: notificationDropdownMobile, chevron: null },
      { element: dateMenu, chevron: dateChevron },
      { element: statsMenu, chevron: statsChevron }
    ];

    allDropdowns.forEach(item => {
      if (item.element && item.element !== currentDropdown) {
        item.element.classList.add('hidden');
        if (item.chevron) {
          item.chevron.style.transform = 'rotate(0deg)';
        }
      }
    });
  }
});


//ACCOUNT scripts

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('accounts-grid')) return; // CHANGED
  if (!ReenStore.getUser()) return; // CHANGED

  const STATUS_STYLES = {
    'Completed': 'bg-emerald-500 text-white',
    'Pending': 'bg-gray-300 text-gray-700',
    'Canceled': 'bg-rose-500 text-white'
  };

  let selectedAccountForAction = 'Main Account';

  const eyeOpenSvg = `<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`;
  const eyeClosedSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.88 17.88 0 013.586-4.586m3.172-2.172A9.97 9.97 0 0112 5c7 0 10 7 10 7a17.86 17.86 0 01-2.43 3.32M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>`;

  const openModal = (id) => document.getElementById(id)?.classList.remove('hidden');
  const closeModal = (id) => document.getElementById(id)?.classList.add('hidden');

  const renderTransactions = () => {
    const listContainer = document.getElementById('transactions-list');
    if (!listContainer) return;

    const txs = ReenStore.getTransactions(); // CHANGED
    if (!txs.length) { // CHANGED
      listContainer.innerHTML = '<p class="text-center text-gray-400 text-xs" style="padding:1rem 0">No transaction yet</p>';
      return;
    }

    listContainer.innerHTML = '';
    txs.forEach((tx) => {
      const isPositive = tx.amount > 0;
      const sign = isPositive ? '+' : '-';
      const colorClass = isPositive ? 'text-emerald-500' : 'text-rose-500';
      const symbolBg = isPositive ? 'bg-emerald-500' : 'bg-rose-500';
      const statusClass = STATUS_STYLES[tx.status] || 'bg-gray-300 text-gray-700';

      const row = document.createElement('div');
      row.className = 'flex items-center justify-between gap-2 lg:gap-0 py-2 border-b border-gray-100 text-xs';
      row.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1 lg:flex-none">
          <div class="w-7 h-7 rounded-full ${symbolBg} text-white flex items-center justify-center font-bold">${sign}</div>
          <div class="min-w-0">
            <p class="font-bold text-gray-800 truncate">${ReenStore.esc(tx.name)}</p>
            <p class="text-gray-400 text-[10px]">${ReenStore.esc(tx.type)}</p>
          </div>
        </div>
        <div class="hidden sm:block text-gray-400 text-[11px] shrink-0">${ReenStore.formatDate(tx.ts, 'space')}</div>
        <div class="font-bold ${colorClass} shrink-0">${sign}${ReenStore.fmt(Math.abs(tx.amount))}</div>
        <div class="shrink-0"><span class="px-3 py-1 rounded-md text-[10px] font-semibold ${statusClass}">${tx.status}</span></div>
      `;
      listContainer.appendChild(row);
    });
  };

  // CHANGED: refresh only balances that are currently revealed
  const updateVisibleBalances = () => {
    const accounts = ReenStore.getAccounts();
    document.querySelectorAll('.account-card').forEach((card) => {
      if (card.dataset.visible !== 'true') return;
      card.querySelector('.account-balance').textContent = `₦ ${ReenStore.fmt(accounts[card.dataset.account] || 0)}`;
    });
  };

  const setupCardEvents = (card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.account-card').forEach((c) => c.classList.remove('active-account-border'));
      card.classList.add('active-account-border');
      selectedAccountForAction = card.dataset.account;
    });

    const eyeBtn = card.querySelector('.toggle-eye-btn');
    const balanceText = card.querySelector('.account-balance');

    if (eyeBtn && balanceText) {
      eyeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = card.dataset.visible !== 'true'; // CHANGED
        card.dataset.visible = String(isVisible);
        if (isVisible) {
          const val = ReenStore.getAccounts()[card.dataset.account] || 0; // CHANGED
          balanceText.textContent = `₦ ${ReenStore.fmt(val)}`;
          eyeBtn.innerHTML = eyeOpenSvg;
        } else {
          balanceText.textContent = '*****';
          eyeBtn.innerHTML = eyeClosedSvg;
        }
      });
    }

    card.querySelector('.fund-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedAccountForAction = card.dataset.account;
      openModal('fund-modal');
    });

    card.querySelector('.withdraw-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedAccountForAction = card.dataset.account;
      openModal('withdraw-modal');
    });
  };

  // CHANGED: card builder shared by "add account" and page load
  const createAccountCard = (accountName) => {
    const newCard = document.createElement('div');
    newCard.className = 'account-card bg-[#d8f3e5] p-4 lg:p-5 rounded-2xl relative transition cursor-pointer shadow-sm';
    newCard.dataset.account = accountName;
    newCard.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#46237A]">${ReenStore.esc(accountName)}</span>
        <button class="toggle-eye-btn p-1 text-gray-600 hover:text-gray-900 transition" aria-label="Toggle Balance Visibility">
          ${eyeClosedSvg}
        </button>
      </div>
      <p class="account-balance text-base lg:text-xl font-bold text-gray-900 mb-3 lg:mb-5">*****</p>
      <div class="flex items-center gap-2">
        <button class="fund-btn bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] lg:text-xs font-medium px-2 lg:px-4 py-2 rounded-lg transition flex-1">Fund</button>
        <button class="withdraw-btn bg-gray-300 hover:bg-gray-400 text-gray-800 text-[11px] lg:text-xs font-medium px-2 lg:px-4 py-2 rounded-lg transition flex-1">Withdraw</button>
      </div>
    `;
    setupCardEvents(newCard);
    return newCard;
  };

  document.querySelectorAll('.account-card').forEach(setupCardEvents);

  // CHANGED: restore saved extra accounts
  ReenStore.getExtra().forEach(({ name }) => {
    if (document.querySelector(`.account-card[data-account="${CSS.escape(name)}"]`)) return;
    const card = createAccountCard(name);
    const addCard = document.getElementById('add-account-card');
    if (addCard) addCard.replaceWith(card);
    else document.getElementById('accounts-grid').appendChild(card);
  });

  // Payment method switching (Fund modal)
  const directPayRadio = document.querySelector('input[value="Direct Pay"]');
  const creditCardRadio = document.querySelector('input[value="Credit Card"]');
  const creditCardFields = document.getElementById('credit-card-fields');
  const btnDirectPay = document.getElementById('btn-direct-pay');
  const btnCreditCard = document.getElementById('btn-credit-card');

  const updatePaymentMethodUI = () => {
    if (creditCardRadio?.checked) {
      creditCardFields?.classList.remove('hidden');
      btnCreditCard?.classList.add('border-emerald-500');
      btnCreditCard?.classList.remove('border-gray-200');
      btnDirectPay?.classList.remove('border-emerald-500');
      btnDirectPay?.classList.add('border-gray-200');
    } else {
      creditCardFields?.classList.add('hidden');
      btnDirectPay?.classList.add('border-emerald-500');
      btnDirectPay?.classList.remove('border-gray-200');
      btnCreditCard?.classList.remove('border-emerald-500');
      btnCreditCard?.classList.add('border-gray-200');
    }
  };

  directPayRadio?.addEventListener('change', updatePaymentMethodUI);
  creditCardRadio?.addEventListener('change', updatePaymentMethodUI);

  // Modal close buttons
  document.getElementById('close-fund-modal')?.addEventListener('click', () => closeModal('fund-modal'));
  document.getElementById('close-withdraw-modal')?.addEventListener('click', () => closeModal('withdraw-modal'));
  document.getElementById('close-add-modal')?.addEventListener('click', () => closeModal('add-account-modal'));
  document.getElementById('close-success-btn')?.addEventListener('click', () => closeModal('success-modal'));

  // Fund submission
  document.getElementById('submit-fund-btn')?.addEventListener('click', () => {
    const input = document.getElementById('fund-amount-input');
    const amount = parseFloat(input?.value);

    if (!amount || amount <= 0) return alert('Please enter a valid amount');

    const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'Direct Pay';

    const accounts = ReenStore.getAccounts(); // CHANGED
    accounts[selectedAccountForAction] = (accounts[selectedAccountForAction] || 0) + amount;
    ReenStore.saveAccounts(accounts);

    ReenStore.addTransaction({ // CHANGED
      name: ReenStore.getUser().name,
      type: paymentMethod,
      amount: amount,
      status: 'Completed',
      account: selectedAccountForAction
    });
    ReenStore.addNotification({ // CHANGED
      before: 'You added',
      amount: amount,
      after: `to your ${selectedAccountForAction}`,
      tone: 'credit'
    });

    renderTransactions();
    updateVisibleBalances(); // CHANGED
    ReenStore.renderNotifications(); // CHANGED
    closeModal('fund-modal');

    const successText = document.getElementById('success-message-text');
    if (successText) successText.textContent = `₦ ${amount.toLocaleString()} has been added to ${selectedAccountForAction}!`;
    openModal('success-modal');
    if (input) input.value = '';
  });

  // Withdrawal submission
  document.getElementById('submit-withdraw-btn')?.addEventListener('click', () => {
    const input = document.getElementById('withdraw-amount-input');
    const amount = parseFloat(input?.value);

    if (!amount || amount <= 0) return alert('Please enter a valid amount');

    const accounts = ReenStore.getAccounts(); // CHANGED
    if (amount > (accounts[selectedAccountForAction] || 0)) return alert('Insufficient balance');

    const textInputs = document.querySelectorAll('#withdraw-modal input[type="text"]'); // CHANGED
    const recipient = textInputs[1]?.value.trim() || '';

    accounts[selectedAccountForAction] -= amount;
    ReenStore.saveAccounts(accounts);

    ReenStore.addTransaction({ // CHANGED
      name: recipient || 'External Account',
      type: 'Bank Transfer',
      amount: -amount,
      status: 'Completed',
      account: selectedAccountForAction
    });
    ReenStore.addNotification({ // CHANGED
      before: recipient ? 'You sent' : 'You withdrew',
      amount: amount,
      after: recipient ? `to ${recipient}` : `from your ${selectedAccountForAction}`,
      tone: 'debit'
    });

    renderTransactions();
    updateVisibleBalances(); // CHANGED
    ReenStore.renderNotifications(); // CHANGED
    closeModal('withdraw-modal');

    const successText = document.getElementById('success-message-text');
    if (successText) successText.textContent = `₦ ${amount.toLocaleString()} withdrawal was successful!`;
    openModal('success-modal');
    if (input) input.value = '';
    textInputs.forEach((t) => { t.value = ''; }); // CHANGED
  });

  // Add new account
  document.getElementById('add-account-card')?.addEventListener('click', () => {
    openModal('add-account-modal');
  });

  document.getElementById('submit-add-account-btn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('new-account-name');
    const accountName = nameInput?.value.trim();
    const descInput = document.getElementById('new-account-desc');

    if (!accountName) return alert('Please enter an account name');
    if (accountName in ReenStore.getAccounts()) return alert('An account with this name already exists'); // CHANGED

    ReenStore.addExtra(accountName, descInput?.value.trim() || ''); // CHANGED

    const newCard = createAccountCard(accountName); // CHANGED
    const addCard = document.getElementById('add-account-card');
    if (addCard) addCard.replaceWith(newCard);
    else document.getElementById('accounts-grid').appendChild(newCard);
    closeModal('add-account-modal');

    const successText = document.getElementById('success-message-text');
    if (successText) successText.textContent = `Account "${accountName}" created successfully!`;
    openModal('success-modal');

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
  });

  renderTransactions();
});
