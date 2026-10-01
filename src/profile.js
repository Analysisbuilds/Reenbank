document.addEventListener('DOMContentLoaded', () => {

  // guard + shared data
  if (!ReenStore.requireUser()) return;
  ReenStore.applyUser();
  ReenStore.applyAvatar();
  ReenStore.renderNotifications();

  // local storage init.......... ---
  const DEFAULT_PHONE = '+234 000 0000 000';
  const DEFAULT_GENDER = 'Male';

  let savedPhone = localStorage.getItem('reen_user_phone') || DEFAULT_PHONE;
  let savedGender = localStorage.getItem('reen_user_gender') || DEFAULT_GENDER;

  //  balances and transactions come from the shared store
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

  //mobile search ---
  const mobileSearchBtn = document.getElementById('mobile-search-toggle');
  const searchContainer = document.getElementById('search-input-container');

  mobileSearchBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    searchContainer?.classList.toggle('hidden');
  });

  // image is resized before saving so localStorage does not overflow
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
      resizeImage(file, (dataUrl) => { 
        if (!ReenStore.setImage(dataUrl)) return alert('Could not save the image. Try a smaller one.');
        ReenStore.applyAvatar();
      });
    }
  });

  // phone number ---
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

  // --- rditable gender---
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

  // main account balance toggle ---
  //  supports the id (desktop) and the .main-account-balance / .toggle-account-eye classes (extra mobile copies)
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

  // lander transactions ---
  const sideTransactionsList = document.getElementById('side-transactions-list');
  if (sideTransactionsList) {
    sideTransactionsList.innerHTML = '';
    if (!transactions.length) { 
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


  // fix handles desktop + mobile pairs, badge comes back on new notifications
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

  //  same pop up as dashboard/accounts, injected so profile.html markup stays untouched
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


  // Password reset Overlays. injected 
  const rpInput = 'w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-[#34be82] focus:ring-1 focus:ring-[#34be82] text-slate-800 placeholder-slate-400 pr-8';
  const rpOtp = 'rp-otp w-full h-9 text-center text-xs font-semibold border border-slate-200 rounded-md focus:outline-none focus:border-[#34be82] focus:ring-1 focus:ring-[#34be82] text-slate-800';
  const rpBtn = 'w-full py-2 bg-[#34be82] hover:bg-[#2ca872] text-white font-bold text-xs rounded-md transition-colors duration-200 shadow-sm cursor-pointer';
  const rpCard = 'bg-white shadow-[0px_0px_40px_#34be82] rounded-2xl p-5 sm:p-6 max-w-sm w-full';
  const rpLock = '<svg class="w-3.5 h-3.5 absolute right-2.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>';

  if (!document.getElementById('reset-modal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="reset-modal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs hidden items-center justify-center p-4 z-60 flex">

        <div data-rp-step="1" class="${rpCard}">
          <h2 class="text-xl font-bold text-[#34be82] mb-4">Reset Password</h2>
          <form id="rp-email-form" class="space-y-3">
            <div class="space-y-0.5">
              <label class="block text-[10px] font-semibold text-black tracking-wide">Email</label>
              <div class="relative flex items-center">
                <input id="rp-email" type="email" placeholder="Enter your Email" class="${rpInput}" required />
                <svg class="w-3.5 h-3.5 absolute right-2.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <p id="rp-email-error" class="hidden text-[10px] text-red-500"></p>
            </div>
            <button type="submit" class="${rpBtn}">Reset Password</button>
          </form>
        </div>

        <div data-rp-step="2" class="hidden ${rpCard}">
          <h2 class="text-xl font-bold text-[#34be82] mb-2">Enter Otp</h2>
          <p class="text-[11px] text-slate-400 mb-3 leading-tight">
            A 6-digit code has been sent to your email <span id="rp-email-masked" class="text-slate-600 font-medium"></span>
            <button type="button" id="rp-change" class="text-[#34be82] font-semibold hover:underline cursor-pointer">Change</button>
          </p>
          <form id="rp-otp-form" class="space-y-3">
            <div class="grid grid-cols-6 gap-1.5">
              ${('<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="' + rpOtp + '" required />').repeat(6)}
            </div>
            <div id="rp-timer-box" class="text-[11px] font-semibold text-[#34be82]"><span id="rp-countdown">0:59</span> remaining</div>
            <button type="submit" class="${rpBtn}">Confirm</button>
            <p class="text-[10px] text-slate-400 text-left pt-0.5">
              <button type="button" id="rp-resend-btn" class="text-[#34be82] font-semibold hover:underline cursor-pointer"></button>
            </p>
          </form>
        </div>

        <div data-rp-step="3" class="hidden ${rpCard}">
          <h2 class="text-xl font-bold text-[#34be82] mb-4">Enter new Password</h2>
          <form id="rp-password-form" class="space-y-3">
            <div class="space-y-0.5">
              <label class="block text-[10px] font-semibold text-black tracking-wide">New Password</label>
              <div class="relative flex items-center">
                <input id="rp-new-password" type="password" placeholder="Enter your Password" class="${rpInput}" required />
                ${rpLock}
              </div>
            </div>
            <div class="space-y-0.5">
              <label class="block text-[10px] font-semibold text-black tracking-wide">Retype Password</label>
              <div class="relative flex items-center">
                <input id="rp-retype-password" type="password" placeholder="Retype your Password" class="${rpInput}" required />
                ${rpLock}
              </div>
              <p id="rp-password-error" class="hidden text-[10px] text-red-500"></p>
            </div>
            <button type="submit" class="${rpBtn}">Change Password</button>
          </form>
        </div>

        <div data-rp-step="4" class="hidden ${rpCard}">
          <p class="text-xs sm:text-sm font-medium text-slate-700 mt-10 mb-6">Your password has been changed!</p>
          <button type="button" id="rp-go-back" class="${rpBtn}">Go Back</button>
        </div>

      </div>`);
  }

  const resetModal = document.getElementById('reset-modal');
  const rpSteps = resetModal.querySelectorAll('[data-rp-step]');
  const rpOtpBoxes = resetModal.querySelectorAll('.rp-otp');
  const rpTimerBox = document.getElementById('rp-timer-box');
  const rpTimerHTML = rpTimerBox.innerHTML;
  let rpInterval = null;

  const rpShowStep = (n) => rpSteps.forEach((s) => s.classList.toggle('hidden', s.dataset.rpStep !== String(n)));
  const rpShowError = (id, msg) => {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
  };

  const rpStopTimer = () => clearInterval(rpInterval);
  const rpStartTimer = () => {
    rpStopTimer();
    let remaining = 59;
    rpTimerBox.innerHTML = rpTimerHTML;
    const el = document.getElementById('rp-countdown');
    const show = () => { el.textContent = `0:${String(remaining).padStart(2, '0')}`; };
    show();
    rpInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        rpStopTimer();
        rpTimerBox.innerHTML = '<button type="button" id="rp-resend-link" class="hover:underline cursor-pointer">Resend code</button>';
        return;
      }
      show();
    }, 1000);
  };
  const rpResend = () => {
    rpOtpBoxes.forEach((b) => { b.value = ''; });
    rpOtpBoxes[0].focus();
    rpStartTimer();
  };

  const openReset = () => {
    resetModal.querySelectorAll('form').forEach((f) => f.reset());
    rpShowError('rp-email-error', '');
    rpShowError('rp-password-error', '');
    rpShowStep(1);
    resetModal.classList.remove('hidden');
  };
  const closeReset = () => {
    rpStopTimer();
    resetModal.classList.add('hidden');
  };

  resetModal.addEventListener('click', (e) => {
    if (e.target === resetModal) closeReset();
  });

  document.getElementById('rp-email-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('rp-email').value.trim().toLowerCase();
    if (email !== ReenStore.getUser().email) return rpShowError('rp-email-error', 'This email does not match your account.');
    rpShowError('rp-email-error', '');
    const parts = email.split('@');
    document.getElementById('rp-email-masked').textContent = `${parts[0].length > 2 ? parts[0].substring(0, 2) : parts[0]}****@${parts[1]}`;
    rpShowStep(2);
    rpStartTimer();
  });

  document.getElementById('rp-change').addEventListener('click', () => {
    rpStopTimer();
    rpShowStep(1);
  });

  rpTimerBox.addEventListener('click', (e) => {
    if (e.target.id === 'rp-resend-link') rpResend();
  });
  document.getElementById('rp-resend-btn').addEventListener('click', rpResend);

  rpOtpBoxes.forEach((box, idx) => {
    box.addEventListener('focus', () => box.select());
    box.addEventListener('keyup', (e) => {
      if (['Tab', 'Shift', 'Meta', 'Control', 'Alt'].includes(e.key)) return;
      if (box.value.length === 1 && idx < rpOtpBoxes.length - 1 && e.key !== 'Backspace') rpOtpBoxes[idx + 1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && idx > 0) rpOtpBoxes[idx - 1].focus();
    });
  });

  document.getElementById('rp-otp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    rpStopTimer();
    rpShowStep(3);
  });

  document.getElementById('rp-password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('rp-new-password').value;
    const retype = document.getElementById('rp-retype-password').value;
    if (newPassword.length < 6) return rpShowError('rp-password-error', 'Password must be at least 6 characters.');
    if (newPassword !== retype) return rpShowError('rp-password-error', 'Passwords do not match.');
    rpShowError('rp-password-error', '');

    const storedUser = JSON.parse(localStorage.getItem('reen_user'));
    storedUser.password = newPassword;
    localStorage.setItem('reen_user', JSON.stringify(storedUser));

    rpShowStep(4);
  });

  document.getElementById('rp-go-back').addEventListener('click', closeReset);

  document.querySelectorAll('button, a, [data-reset-password]').forEach((el) => {
    if (el.closest('#reset-modal')) return;
    const isTrigger = el.id === 'reset-password-btn' || el.hasAttribute('data-reset-password') || el.textContent.trim().toLowerCase() === 'reset password';
    if (!isTrigger) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openReset();
    });
  });
});


