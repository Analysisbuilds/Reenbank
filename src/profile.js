document.addEventListener('DOMContentLoaded', () => {

  // CHANGED: guard + shared data
  if (!ReenStore.requireUser()) return;
  ReenStore.applyUser();
  ReenStore.applyAvatar();
  ReenStore.renderNotifications();

  // --- 1. LOCAL STORAGE STATE INITIALIZATION ---
  const DEFAULT_PHONE = '+234 000 0000 000';
  const DEFAULT_GENDER = 'Male';

  let savedPhone = localStorage.getItem('reen_user_phone') || DEFAULT_PHONE;
  let savedGender = localStorage.getItem('reen_user_gender') || DEFAULT_GENDER;

  // CHANGED: balances and transactions come from the shared store
  const accountBalances = ReenStore.getAccounts();
  const transactions = ReenStore.getTransactions();

  // Eye Icons
  const eyeOpenSvg = `<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`;
  const eyeClosedSvg = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.88 17.88 0 013.586-4.586m3.172-2.172A9.97 9.97 0 0112 5c7 0 10 7 10 7a17.86 17.86 0 01-2.43 3.32M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>`;

  // Initial Profile Display
  const phoneValue = document.getElementById('phone-value');
  const genderValue = document.getElementById('gender-value');

  if (phoneValue) phoneValue.textContent = savedPhone;
  if (genderValue) genderValue.textContent = savedGender;

  // --- 2. MOBILE SEARCH TOGGLE ---
  const mobileSearchBtn = document.getElementById('mobile-search-toggle');
  const searchContainer = document.getElementById('search-input-container');

  mobileSearchBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    searchContainer?.classList.toggle('hidden');
  });

  // --- 3. EDITABLE PROFILE IMAGE ---
  // CHANGED: image is resized before saving so localStorage does not overflow
  const resizeImage = (file, done) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const size = 300;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const side = Math.min(img.width, img.height);
        canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        done(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const imageUploadInput = document.getElementById('image-upload-input');
  imageUploadInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      resizeImage(file, (dataUrl) => { // CHANGED
        if (!ReenStore.setImage(dataUrl)) return alert('Could not save the image. Try a smaller one.');
        ReenStore.applyAvatar();
      });
    }
  });

  // --- 4. EDITABLE PHONE NUMBER ---
  const editPhoneBtn = document.getElementById('edit-phone-btn');
  const phoneContainer = document.getElementById('phone-display-container');

  editPhoneBtn?.addEventListener('click', () => {
    const currentVal = (document.getElementById('phone-value')?.textContent || savedPhone).trim(); // CHANGED
    phoneContainer.innerHTML = `
      <div class="flex items-center gap-2 pb-1 border-b border-gray-200">
        <input type="text" id="phone-input" value="${ReenStore.esc(currentVal)}" class="text-sm font-semibold text-gray-800 w-full focus:outline-none bg-transparent"/>
        <button id="save-phone-btn" class="bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-md hover:bg-emerald-600 transition">Save</button>
      </div>
    `;

    document.getElementById('save-phone-btn')?.addEventListener('click', () => {
      const newVal = document.getElementById('phone-input').value.trim();
      if (newVal) {
        savedPhone = newVal;
        localStorage.setItem('reen_user_phone', savedPhone);
        phoneContainer.innerHTML = `<p id="phone-value" class="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">${ReenStore.esc(savedPhone)}</p>`;
      }
    });
  });

  // --- 5. EDITABLE GENDER ---
  const editGenderBtn = document.getElementById('edit-gender-btn');
  const genderContainer = document.getElementById('gender-display-container');

  editGenderBtn?.addEventListener('click', () => {
    const currentVal = (document.getElementById('gender-value')?.textContent || savedGender).trim(); // CHANGED
    genderContainer.innerHTML = `
      <div class="flex items-center gap-2 pb-1 border-b border-gray-200">
        <select id="gender-select" class="text-sm font-semibold text-gray-800 w-full focus:outline-none bg-transparent">
          <option value="Female" ${currentVal === 'Female' ? 'selected' : ''}>Female</option>
          <option value="Male" ${currentVal === 'Male' ? 'selected' : ''}>Male</option>
          <option value="Other" ${currentVal === 'Other' ? 'selected' : ''}>Other</option>
        </select>
        <button id="save-gender-btn" class="bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-md hover:bg-emerald-600 transition">Save</button>
      </div>
    `;

    document.getElementById('save-gender-btn')?.addEventListener('click', () => {
      const newVal = document.getElementById('gender-select').value;
      savedGender = newVal;
      localStorage.setItem('reen_user_gender', savedGender);
      genderContainer.innerHTML = `<p id="gender-value" class="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">${savedGender}</p>`;
    });
  });

  // --- 6. MAIN ACCOUNT BALANCE TOGGLE ---
  // CHANGED: supports the id (desktop) and the .main-account-balance / .toggle-account-eye classes (extra mobile copies)
  const balanceTexts = document.querySelectorAll('#main-account-balance, .main-account-balance');
  const toggleEyeBtns = document.querySelectorAll('#toggle-account-eye, .toggle-account-eye');
  let isBalanceVisible = false;

  toggleEyeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      isBalanceVisible = !isBalanceVisible;
      const mainBalance = ReenStore.getAccounts()['Main Account'] || 0;
      balanceTexts.forEach((el) => {
        el.textContent = isBalanceVisible ? `₦ ${ReenStore.fmt(mainBalance)}` : '*****';
      });
      toggleEyeBtns.forEach((b) => { b.innerHTML = isBalanceVisible ? eyeOpenSvg : eyeClosedSvg; });
    });
  });

  // --- 7. RENDER SIDE TRANSACTIONS ---
  const sideTransactionsList = document.getElementById('side-transactions-list');
  if (sideTransactionsList) {
    sideTransactionsList.innerHTML = '';
    if (!transactions.length) { // CHANGED
      sideTransactionsList.innerHTML = '<p class="text-center text-gray-400 text-[11px]" style="padding:1rem 0">No transaction yet</p>';
    }
    transactions.slice(0, 8).forEach((tx) => {
      const isPositive = tx.amount > 0;
      const colorClass = isPositive ? 'text-emerald-500' : 'text-red-500';
      const sign = isPositive ? '+' : '-';

      const row = document.createElement('div');
      row.className = 'flex items-center justify-between py-1.5 border-b border-gray-200/50';
      row.innerHTML = `
        <span class="text-gray-600 text-[11px] font-medium">${ReenStore.esc(tx.name || 'Transaction')}</span>
        <span class="text-gray-400 text-[10px]">${ReenStore.formatDate(tx.ts, 'space')}</span>
        <span class="font-bold ${colorClass} text-[11px]">${sign}${ReenStore.fmt(Math.abs(tx.amount))}</span>
      `;
      sideTransactionsList.appendChild(row);
    });
  }

  // --- 8. NOTIFICATION DROPDOWN TOGGLE ---
  // CHANGED: handles desktop + mobile pairs, badge comes back on new notifications
  const notifPairs = [
    [document.getElementById('notification-btn'), document.getElementById('notification-dropdown')],
    [document.getElementById('notification-btn-mobile'), document.getElementById('notification-dropdown-mobile')]
  ].filter(([btn, dd]) => btn && dd);

  notifPairs.forEach(([btn, dd]) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPairs.forEach(([, other]) => { if (other !== dd) other.classList.add('hidden'); });
      dd.classList.toggle('hidden');
      ReenStore.markRead();
    });
    dd.addEventListener('click', (e) => e.stopPropagation());
  });

  document.addEventListener('click', () => {
    notifPairs.forEach(([, dd]) => dd.classList.add('hidden'));
    if (window.innerWidth < 1024 && searchContainer) {
      searchContainer.classList.add('hidden');
    }
  });

  // --- 9. LOGOUT MODAL ---
  // CHANGED: same modal as dashboard/accounts, injected so profile.html markup stays untouched
  if (!document.getElementById('logout-modal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div 
        id="logout-modal" 
        onclick="if(event.target === this) this.classList.add('hidden');"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs hidden items-center justify-center p-4 z-60 flex"
        >
        <div class="bg-white shadow-[0px_0px_40px_#34be82] rounded-3xl p-8 max-w-sm w-full ">
          <p class="text-slate-600 text-sm font-medium text-center mb-8">
            Are you sure you want to Logout?
          </p>
          <div class="flex items-center justify-center space-x-4">
            <button 
              type="button" 
              onclick="document.getElementById('logout-modal').classList.add('hidden');" 
              class="w-1/2 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <a 
              href="login.html" 
              class="w-1/2 py-2.5 bg-[#34be82] hover:bg-[#2ca872] text-white font-bold text-xs rounded-lg text-center transition-colors shadow-sm cursor-pointer block"
            >
              Logout
            </a>
          </div>
        </div>
      </div>`);
  }

  document.querySelectorAll('button, a').forEach((el) => {
    if (el.closest('#logout-modal')) return;
    if (el.textContent.trim().toLowerCase() !== 'logout' && el.id !== 'logout-btn') return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('logout-modal').classList.remove('hidden');
    });
  });

});