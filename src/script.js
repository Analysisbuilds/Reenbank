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
