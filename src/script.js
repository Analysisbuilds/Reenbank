document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
      } else {
        mobileMenu.classList.add('hidden');
        menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
      }
    });
  }


const faqNavBtns = document.querySelectorAll('.faq-nav-btn');
const faqDisplay = document.getElementById('faq-display');
const activeTitle = document.getElementById('active-faq-title');
const activeAnswer = document.getElementById('active-faq-answer');
if (faqNavBtns.length > 0 && activeTitle && activeAnswer) {
  faqNavBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const newTitle = btn.getAttribute('data-title');
      const newAnswer = btn.getAttribute('data-answer');
      faqDisplay.classList.add('opacity-0', '-translate-x-2');
      setTimeout(() => {
        activeTitle.textContent = newTitle;
        activeAnswer.textContent = newAnswer;
        faqDisplay.classList.remove('opacity-0', '-translate-x-2');
      }, 150);
    });
  })
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const registerCard = document.getElementById('register-card');
    const verifyCard = document.getElementById('verify-card');
    const registerForm = document.getElementById('register-form');
    const userEmailInput = document.getElementById('user-email');
    const displayEmailText = document.getElementById('display-email-text');
    const backToRegister = document.getElementById('back-to-register');
    const verifyForm = document.getElementById('verify-form');
    const successCard = document.getElementById('success-card');

    // Switch when submit
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // asterik in  email
      const email = userEmailInput.value;
      if (email) {
        const parts = email.split('@');
        const masked = parts[0].length > 2 
          ? parts[0].substring(0, 2) + '****' 
          : parts[0] + '****';
        displayEmailText.textContent = `${masked}@${parts[1]}`;
      }

      registerCard.classList.add('hidden');
      registerCard.classList.remove('block');
      
      verifyCard.classList.remove('hidden');
      verifyCard.classList.add('block');
    });

    // Step 2 -> Step 3 (Verify Email -> Success Screen)
    verifyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      verifyCard.classList.add('hidden');
      verifyCard.classList.remove('block');

      successCard.classList.remove('hidden');
      successCard.classList.add('block');
    });

    // GoBack to register when clicking Change
    backToRegister.addEventListener('click', () => {
      verifyCard.classList.add('hidden');
      verifyCard.classList.remove('block');
      
      registerCard.classList.remove('hidden');
      registerCard.classList.add('block');
    });

    // Auto focus next input for OTP digits
    const otpBoxes = document.querySelectorAll('.otp-box');
    otpBoxes.forEach((box, idx) => {
      box.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && idx < otpBoxes.length - 1) {
          otpBoxes[idx + 1].focus();
        }
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
          otpBoxes[idx - 1].focus();
        }
      });
    });
  });