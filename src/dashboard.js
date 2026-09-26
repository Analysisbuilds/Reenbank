document.addEventListener('DOMContentLoaded', () => {
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
      closeOtherDropdowns(notificationDropdown);
    });
  }

  // notifications (mobile top-bar version)
  const notificationBtnMobile = document.getElementById('notification-btn-mobile');
  const notificationDropdownMobile = document.getElementById('notification-dropdown-mobile');

  if (notificationBtnMobile && notificationDropdownMobile) {
    notificationBtnMobile.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdownMobile.classList.toggle('hidden');
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


//Accounts scripts

document.addEventListener('DOMContentLoaded', () => {

  // -----------------------------------------------------------------
  // 1. Initial State & Data Store
  // -----------------------------------------------------------------
  let activeCard = document.querySelector('.account-card');
  let selectedAccountForAction = null;

  const accountBalances = {
    'Main Account': 44500,
    'School Savings': 44500,
    'Holiday Plan': 44500
  };

  const initialTransactions = [
    { type: 'Bank Transfer', method: 'Bank Transfer', date: '06 Mar 2023 - 09:30', amount: -10000, status: 'Pending' },
    { type: 'Direct Pay', method: 'Direct Pay', date: '06 Mar 2023 - 09:30', amount: 10000, status: 'Completed' },
    { type: 'Bank Transfer', method: 'Bank Transfer', date: '06 Mar 2023 - 09:28', amount: -10000, status: 'Canceled' },
    { type: 'Credit Card', method: 'Credit Card', date: '06 Mar 2023 - 09:28', amount: 10000, status: 'Completed' },
    { type: 'Bank Transfer', method: 'Bank Transfer', date: '06 Mar 2023 - 09:20', amount: -10000, status: 'Pending' },
    { type: 'Direct Pay', method: 'Direct Pay', date: '06 Mar 2023 - 09:00', amount: 10000, status: 'Completed' }
  ];

  // -----------------------------------------------------------------
  // 2. Notification Toggle
  // -----------------------------------------------------------------
  const notifBtn = document.getElementById('notification-btn');
  const notifDropdown = document.getElementById('notification-dropdown');

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.add('hidden');
      }
    });
  }

  // -----------------------------------------------------------------
  // 3. Transactions List Renderer
  // -----------------------------------------------------------------
  const renderTransactions = () => {
    const container = document.getElementById('transactions-list');
    if (!container) return;

    container.innerHTML = initialTransactions.map((t) => {
      const isPositive = t.amount > 0;
      const statusColors = {
        Completed: 'bg-emerald-500 text-white',
        Pending: 'bg-gray-300 text-gray-700',
        Canceled: 'bg-rose-500 text-white'
      };

      return `
        <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-none text-xs">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} text-white flex items-center justify-center font-bold">
              ${isPositive ? '+' : '-'}
            </div>
            <div>
              <p class="font-bold text-gray-800">Olanrewaju Luqman</p>
              <p class="text-gray-400 text-[10px]">${t.method}</p>
            </div>
          </div>
          <div class="text-gray-400 text-[11px]">${t.date}</div>
          <div class="font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}">
            ${isPositive ? '+' : ''}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div>
            <span class="px-3 py-1 rounded-md text-[10px] font-semibold ${statusColors[t.status]}">${t.status}</span>
          </div>
        </div>
      `;
    }).join('');
  };

  renderTransactions();

  // -----------------------------------------------------------------
  // 4. Card Selection & Eye Toggle Event Delegation
  // -----------------------------------------------------------------
  const accountsGrid = document.getElementById('accounts-grid');

  const setupCardEvents = (card) => {
    // Select Card & Show Purple Left Border
    card.addEventListener('click', (e) => {
      if (e.target.closest('.toggle-eye-btn') || e.target.closest('.fund-btn') || e.target.closest('.withdraw-btn')) {
        return; // Avoid selecting card if buttons inside it are clicked
      }
      document.querySelectorAll('.account-card').forEach((c) => c.classList.remove('active-account-border'));
      card.classList.add('active-account-border');
      activeCard = card;
    });

    // Eye Toggle functionality
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
          eyeBtn.innerHTML = '<i class="fa-regular fa-eye text-xs"></i>';
        } else {
          balanceText.textContent = '*****';
          eyeBtn.innerHTML = '<i class="fa-regular fa-eye-slash text-xs"></i>';
        }
      });
    }

    // Fund Button
    const fundBtn = card.querySelector('.fund-btn');
    fundBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedAccountForAction = card.dataset.account;
      openModal('fund-modal');
    });

    // Withdraw Button
    const withdrawBtn = card.querySelector('.withdraw-btn');
    withdrawBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedAccountForAction = card.dataset.account;
      openModal('withdraw-modal');
    });
  };

  document.querySelectorAll('.account-card').forEach(setupCardEvents);

  // -----------------------------------------------------------------
  // 5. Payment Method Switch (Direct Pay vs Credit Card)
  // -----------------------------------------------------------------
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

  // -----------------------------------------------------------------
  // 6. Modal Helpers & Handlers
  // -----------------------------------------------------------------
  const openModal = (id) => document.getElementById(id)?.classList.remove('hidden');
  const closeModal = (id) => document.getElementById(id)?.classList.add('hidden');

  document.getElementById('close-fund-modal')?.addEventListener('click', () => closeModal('fund-modal'));
  document.getElementById('close-withdraw-modal')?.addEventListener('click', () => closeModal('withdraw-modal'));
  document.getElementById('close-add-modal')?.addEventListener('click', () => closeModal('add-account-modal'));
  document.getElementById('close-success-btn')?.addEventListener('click', () => closeModal('success-modal'));

  // -----------------------------------------------------------------
  // 7. Process Funding
  // -----------------------------------------------------------------
  document.getElementById('submit-fund-btn')?.addEventListener('click', () => {
    const input = document.getElementById('fund-amount-input');
    const amount = parseFloat(input?.value);

    if (!amount || amount <= 0) return alert('Please enter a valid amount');

    const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'Direct Pay';

    // Update account store balance
    accountBalances[selectedAccountForAction] = (accountBalances[selectedAccountForAction] || 0) + amount;

    // Add to transaction log
    initialTransactions.unshift({
      type: paymentMethod,
      method: paymentMethod,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: amount,
      status: 'Completed'
    });

    renderTransactions();
    closeModal('fund-modal');

    // Show Success Modal
    document.getElementById('success-message-text').textContent = `₦ ${amount.toLocaleString()} has been added to your Wallet!`;
    openModal('success-modal');
    if (input) input.value = '';
  });

  // -----------------------------------------------------------------
  // 8. Process Withdrawal
  // -----------------------------------------------------------------
  document.getElementById('submit-withdraw-btn')?.addEventListener('click', () => {
    const input = document.getElementById('withdraw-amount-input');
    const amount = parseFloat(input?.value);

    if (!amount || amount <= 0) return alert('Please enter a valid amount');

    // Deduct balance
    accountBalances[selectedAccountForAction] = (accountBalances[selectedAccountForAction] || 0) - amount;

    // Add transaction record
    initialTransactions.unshift({
      type: 'Bank Transfer',
      method: 'Bank Transfer',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: -amount,
      status: 'Completed'
    });

    renderTransactions();
    closeModal('withdraw-modal');

    // Show Success Modal
    document.getElementById('success-message-text').textContent = `₦ ${amount.toLocaleString()} withdrawal was successful!`;
    openModal('success-modal');
    if (input) input.value = '';
  });

  // -----------------------------------------------------------------
  // 9. Process Add Account (Single-Use Only)
  // -----------------------------------------------------------------
  const addAccountCard = document.getElementById('add-account-card');

  addAccountCard?.addEventListener('click', () => {
    openModal('add-account-modal');
  });

  document.getElementById('submit-add-account-btn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('new-account-name');
    const accountName = nameInput?.value.trim();

    if (!accountName) return alert('Please enter an account name');

    // Initialize balance
    accountBalances[accountName] = 0;

    // Create Card Component dynamically
    const newCard = document.createElement('div');
    newCard.className = 'account-card bg-[#d8f3e5] p-5 rounded-2xl relative transition cursor-pointer shadow-sm';
    newCard.dataset.account = accountName;
    newCard.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-emerald-800">${accountName}</span>
        <button class="toggle-eye-btn text-gray-600 hover:text-gray-900">
          <i class="fa-regular fa-eye-slash text-xs"></i>
        </button>
      </div>
      <p class="account-balance text-xl font-bold text-gray-900 mb-5">*****</p>
      <div class="flex items-center gap-2">
        <button class="fund-btn bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition flex-1">Fund</button>
        <button class="withdraw-btn bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-medium px-4 py-2 rounded-lg transition flex-1">Withdraw</button>
      </div>
    `;

    // Bind event listeners to new account card
    setupCardEvents(newCard);

    // Replace "Add Account" slot with new card
    addAccountCard.replaceWith(newCard);

    closeModal('add-account-modal');

    // Show confirmation modal
    document.getElementById('success-message-text').textContent = `Account "${accountName}" created successfully!`;
    openModal('success-modal');
  });

});