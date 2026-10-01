document.addEventListener('DOMContentLoaded', () => {

  // --- 1. LOCAL STORAGE STATE INITIALIZATION ---
  const DEFAULT_PHONE = '+234 803 041 1314';
  const DEFAULT_GENDER = 'Female';
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  let savedPhone = localStorage.getItem('reen_user_phone') || DEFAULT_PHONE;
  let savedGender = localStorage.getItem('reen_user_gender') || DEFAULT_GENDER;
  let savedImage = localStorage.getItem('reen_user_image') || DEFAULT_IMAGE;

  const DEFAULT_ACCOUNTS = { 'Main Account': 44500 };
  let accountBalances = JSON.parse(localStorage.getItem('reen_accounts')) || DEFAULT_ACCOUNTS;

  const DEFAULT_TRANSACTIONS = [
    { name: 'OluwaBen', date: '06 Mar 2023 - 09:28', amount: -10000 },
    { name: 'OluwaBen', date: '06 Mar 2023 - 09:25', amount: 10000 },
    { name: 'OluwaBen', date: '06 Mar 2023 - 09:15', amount: -10000 },
    { name: 'OluwaBen', date: '06 Mar 2023 - 09:00', amount: 10000 }
  ];
  let transactions = JSON.parse(localStorage.getItem('reen_transactions')) || DEFAULT_TRANSACTIONS;

  // Eye Icons
  const eyeOpenSvg = `<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`;
  const eyeClosedSvg = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.88 17.88 0 013.586-4.586m3.172-2.172A9.97 9.97 0 0112 5c7 0 10 7 10 7a17.86 17.86 0 01-2.43 3.32M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>`;

  // Initial Profile Display
  const profileImageDisplay = document.getElementById('profile-image-display');
  const headerAvatar = document.getElementById('header-avatar');
  const phoneValue = document.getElementById('phone-value');
  const genderValue = document.getElementById('gender-value');

  if (profileImageDisplay) profileImageDisplay.src = savedImage;
  if (headerAvatar) headerAvatar.src = savedImage;
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
  const imageUploadInput = document.getElementById('image-upload-input');
  imageUploadInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        if (profileImageDisplay) profileImageDisplay.src = base64Image;
        if (headerAvatar) headerAvatar.src = base64Image;
        localStorage.setItem('reen_user_image', base64Image);
      };
      reader.readAsDataURL(file);
    }
  });

  // --- 4. EDITABLE PHONE NUMBER ---
  const editPhoneBtn = document.getElementById('edit-phone-btn');
  const phoneContainer = document.getElementById('phone-display-container');

  editPhoneBtn?.addEventListener('click', () => {
    const currentVal = phoneValue.textContent.trim();
    phoneContainer.innerHTML = `
      <div class="flex items-center gap-2 pb-1 border-b border-gray-200">
        <input type="text" id="phone-input" value="${currentVal}" class="text-sm font-semibold text-gray-800 w-full focus:outline-none bg-transparent"/>
        <button id="save-phone-btn" class="bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-md hover:bg-emerald-600 transition">Save</button>
      </div>
    `;

    document.getElementById('save-phone-btn')?.addEventListener('click', () => {
      const newVal = document.getElementById('phone-input').value.trim();
      if (newVal) {
        savedPhone = newVal;
        localStorage.setItem('reen_user_phone', savedPhone);
        phoneContainer.innerHTML = `<p id="phone-value" class="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">${savedPhone}</p>`;
      }
    });
  });

  // --- 5. EDITABLE GENDER ---
  const editGenderBtn = document.getElementById('edit-gender-btn');
  const genderContainer = document.getElementById('gender-display-container');

  editGenderBtn?.addEventListener('click', () => {
    const currentVal = genderValue.textContent.trim();
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

  // --- 6. MAIN ACCOUNT BALANCE TOGGLE (Desktop) ---
  const toggleEyeBtn = document.getElementById('toggle-account-eye');
  const balanceText = document.getElementById('main-account-balance');
  let isBalanceVisible = false;

  toggleEyeBtn?.addEventListener('click', () => {
    isBalanceVisible = !isBalanceVisible;
    if (isBalanceVisible) {
      const mainBalance = accountBalances['Main Account'] || 44500;
      balanceText.textContent = `₦ ${mainBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      toggleEyeBtn.innerHTML = eyeOpenSvg;
    } else {
      balanceText.textContent = '*****';
      toggleEyeBtn.innerHTML = eyeClosedSvg;
    }
  });

  // --- 7. RENDER SIDE TRANSACTIONS (Desktop) ---
  const sideTransactionsList = document.getElementById('side-transactions-list');
  if (sideTransactionsList) {
    sideTransactionsList.innerHTML = '';
    transactions.slice(0, 8).forEach((tx) => {
      const isPositive = tx.amount > 0;
      const colorClass = isPositive ? 'text-emerald-500' : 'text-red-500';
      const sign = isPositive ? '+' : '-';

      const row = document.createElement('div');
      row.className = 'flex items-center justify-between py-1.5 border-b border-gray-200/50';
      row.innerHTML = `
        <span class="text-gray-600 text-[11px] font-medium">${tx.name || 'Transaction'}</span>
        <span class="text-gray-400 text-[10px]">${tx.date}</span>
        <span class="font-bold ${colorClass} text-[11px]">${sign}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      `;
      sideTransactionsList.appendChild(row);
    });
  }

  // --- 8. NOTIFICATION DROPDOWN TOGGLE ---
  const notifBtn = document.getElementById('notification-btn');
  const notifDropdown = document.getElementById('notification-dropdown');
  const notifBadge = document.getElementById('notif-badge');

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
      if (notifBadge) notifBadge.classList.add('hidden');
    });

    notifDropdown.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', () => {
      notifDropdown.classList.add('hidden');
      if (window.innerWidth < 1024 && searchContainer) {
        searchContainer.classList.add('hidden');
      }
    });
  }

});