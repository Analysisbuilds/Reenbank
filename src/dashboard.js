document.addEventListener('DOMContentLoaded', () => {
  // Initialize Feather Icons
  if (window.feather) {
    feather.replace();
  }

  // notifications
  const notificationBtn = document.getElementById('notification-btn');
  const notificationDropdown = document.getElementById('notification-dropdown');
  const notifBadge = document.getElementById('notif-badge'); 

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('hidden');
      if (notifBadge) notifBadge.classList.add('hidden');
      closeOtherDropdowns(notificationDropdown);
    });
  }

  // notifications (mobile response )
  const notificationBtnMobile = document.getElementById('notification-btn-mobile');
  const notificationDropdownMobile = document.getElementById('notification-dropdown-mobile');
  const notifBadgeMobile = document.getElementById('notif-badge-mobile'); 

  if (notificationBtnMobile && notificationDropdownMobile) {
    notificationBtnMobile.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdownMobile.classList.toggle('hidden');
      if (notifBadgeMobile) notifBadgeMobile.classList.add('hidden');
      closeOtherDropdowns(notificationDropdownMobile);
    });
  }

  // date dropdown
  const dateBtn = document.getElementById('date-dropdown-btn');
  const dateMenu = document.getElementById('date-dropdown-menu');
  const dateChevron = document.getElementById('date-chevron');
  const selectedDateText = document.getElementById('selected-date-text');
  const dateOptions = document.querySelectorAll('.date-option');

  if (dateBtn && dateMenu) {
    dateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dateMenu.classList.toggle('hidden');
      if (dateChevron) {
        dateChevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      }
      closeOtherDropdowns(dateMenu);
    });

    dateOptions.forEach(option => {
      option.addEventListener('click', () => {
        selectedDateText.textContent = option.textContent.trim();
        dateMenu.classList.add('hidden');
        if (dateChevron) dateChevron.style.transform = 'rotate(0deg)';
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

    statsOptions.forEach(option => {
      option.addEventListener('click', () => {
        selectedStatsText.textContent = option.textContent.trim();
        statsMenu.classList.add('hidden');
        if (statsChevron) statsChevron.style.transform = 'rotate(0deg)';
      });
    });
  }

  //  eye toggle on dashboard
const toggleBalanceBtn = document.getElementById('toggle-balance-btn');
const eyeIcon = document.getElementById('eye-icon');
const eyeOffIcon = document.getElementById('eye-off-icon');
const balanceTexts = document.querySelectorAll('.balance-text');

let balancesVisible = true;

if (toggleBalanceBtn) {
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

        // Toggle the actual text values
        balanceTexts.forEach(el => {
            if (!balancesVisible) {
                el.dataset.original = el.textContent;
                el.textContent = '*****';
            } else {
                el.textContent = el.dataset.original || '₦ 44,500.00', '₦ 54,500.00', '₦ 10,000.00';
            }
        });
    });
}

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

  const DEFAULT_ACCOUNTS = {
    'Main Account': 44500,
    'School Savings': 44500,
    'Holiday Plan': 44500
  };

  const DEFAULT_TRANSACTIONS = [
    { name: 'Akanmu niyi', type: 'Bank Transfer', date: '06 Mar 2023 - 09:30', amount: -10000, status: 'Pending' },
    { name: 'Akanmu Qodri', type: 'Direct Pay', date: '06 Mar 2023 - 09:30', amount: 10000, status: 'Completed' },
    { name: 'Adeniyi Qodri', type: 'Bank Transfer', date: '06 Mar 2023 - 09:28', amount: -10000, status: 'Canceled' }
  ];

  const STATUS_STYLES = {
    'Completed': 'bg-emerald-500 text-white',
    'Pending': 'bg-gray-300 text-gray-700',
    'Canceled': 'bg-rose-500 text-white'
  };

  let accountBalances = JSON.parse(localStorage.getItem('reen_accounts')) || DEFAULT_ACCOUNTS;
  let initialTransactions = JSON.parse(localStorage.getItem('reen_transactions')) || DEFAULT_TRANSACTIONS;
  let selectedAccountForAction = 'Main Account';

  const eyeOpenSvg = `<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`;
  const eyeClosedSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.88 17.88 0 013.586-4.586m3.172-2.172A9.97 9.97 0 0112 5c7 0 10 7 10 7a17.86 17.86 0 01-2.43 3.32M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>`;

  const saveData = () => {
    localStorage.setItem('reen_accounts', JSON.stringify(accountBalances));
    localStorage.setItem('reen_transactions', JSON.stringify(initialTransactions));
  };

  const openModal = (id) => document.getElementById(id)?.classList.remove('hidden');
  const closeModal = (id) => document.getElementById(id)?.classList.add('hidden');
  const renderTransactions = () => {
    const listContainer = document.getElementById('transactions-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    initialTransactions.forEach((tx) => {
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
            <p class="font-bold text-gray-800 truncate">${tx.name}</p>
            <p class="text-gray-400 text-[10px]">${tx.type}</p>
          </div>
        </div>
        <div class="hidden sm:block text-gray-400 text-[11px] shrink-0">${tx.date}</div>
        <div class="font-bold ${colorClass} shrink-0">${sign}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="shrink-0"><span class="px-3 py-1 rounded-md text-[10px] font-semibold ${statusClass}">${tx.status}</span></div>
      `;
      listContainer.appendChild(row);
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
    const accountName = card.dataset.account;

    if (eyeBtn && balanceText) {
      let isVisible = false;
      eyeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isVisible = !isVisible;
        if (isVisible) {
          const val = accountBalances[accountName] || 0;
          balanceText.textContent = `₦ ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
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

  document.querySelectorAll('.account-card').forEach(setupCardEvents);

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

    accountBalances[selectedAccountForAction] = (accountBalances[selectedAccountForAction] || 0) + amount;

    initialTransactions.unshift({
      name: 'Akanmu Qodri',
      type: paymentMethod,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: amount,
      status: 'Completed'
    });

    saveData();
    renderTransactions();
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

    accountBalances[selectedAccountForAction] = (accountBalances[selectedAccountForAction] || 0) - amount;

    initialTransactions.unshift({
      name: 'Akanmu Qodri',
      type: 'Bank Transfer',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: -amount,
      status: 'Completed'
    });

    saveData();
    renderTransactions();
    closeModal('withdraw-modal');

    const successText = document.getElementById('success-message-text');
    if (successText) successText.textContent = `₦ ${amount.toLocaleString()} withdrawal was successful!`;
    openModal('success-modal');
    if (input) input.value = '';
  });

  // Add new account
  const addAccountCard = document.getElementById('add-account-card');

  addAccountCard?.addEventListener('click', () => {
    openModal('add-account-modal');
  });

  document.getElementById('submit-add-account-btn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('new-account-name');
    const accountName = nameInput?.value.trim();
    const descInput = document.getElementById('new-account-desc');

    if (!accountName) return alert('Please enter an account name');

    accountBalances[accountName] = 0;
    saveData();

    const newCard = document.createElement('div');
    newCard.className = 'account-card bg-[#d8f3e5] p-4 lg:p-5 rounded-2xl relative transition cursor-pointer shadow-sm';
    newCard.dataset.account = accountName;
    newCard.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#46237A]">${accountName}</span>
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
    addAccountCard.replaceWith(newCard);
    closeModal('add-account-modal');

    const successText = document.getElementById('success-message-text');
    if (successText) successText.textContent = `Account "${accountName}" created successfully!`;
    openModal('success-modal');

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
  });

  renderTransactions();
});