document.addEventListener('DOMContentLoaded', () => {
  // Initialize Feather Icons
  if (window.feather) {
    feather.replace();
  }

  // notification
  const notificationBtn = document.getElementById('notification-btn');
  const notificationDropdown = document.getElementById('notification-dropdown');

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('hidden');
      closeOtherDropdowns(notificationDropdown);
    });
  }

  // date dropdow
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

  // stat dropdown
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

        // 1. Toggle the visibility icons
        if (balancesVisible) {
            eyeIcon.classList.add('hidden');
            eyeOffIcon.classList.remove('hidden');
        } else {
            eyeIcon.classList.remove('hidden');
            eyeOffIcon.classList.add('hidden');
        }

        // 2. Toggle the actual text values
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
      
      // On mobile viewports, toggle visibility of transaction side section
      if (window.innerWidth < 1024) {
        transactionsPanel.classList.toggle('hidden');
        transactionsPanel.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // click outside to close open drop dow n
  document.addEventListener('click', () => {
    closeOtherDropdowns(null);
  });

  function closeOtherDropdowns(currentDropdown) {
    const allDropdowns = [
      { element: notificationDropdown, chevron: null },
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