// 해시 스크롤 - 기본은 Projects(메인 허브)
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    window.location.hash = '#projects';
  }
  
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'auto' });
      }
    }, 100);
  }
});

// 스크롤 애니메이션
const sectionObserverOptions = {
  root: null,
  rootMargin: '-20% 0px -20% 0px',
  threshold: 0
};

const sectionAnimObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const section = entry.target;
    const animatedElements = section.querySelectorAll('.animate-on-scroll');
    
    if (entry.isIntersecting) {
      animatedElements.forEach(el => el.classList.add('visible'));
    } else {
      animatedElements.forEach(el => el.classList.remove('visible'));
    }
  });
}, sectionObserverOptions);
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.panel');
  sections.forEach(section => {
    sectionAnimObserver.observe(section);
  });
});

// 네비게이션 활성화
const navSections = document.querySelectorAll('.panel');
const navLinks = document.querySelectorAll('.hash-nav a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const sectionId = entry.target.id;
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.hash-nav a[href="#${sectionId}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, {
  root: null,
  rootMargin: '-50% 0px -50% 0px',
  threshold: 0
});
navSections.forEach(section => {
  sectionObserver.observe(section);
});

// 부드러운 스크롤
function smoothScrollTo(target, duration = 600) {
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    window.scrollTo(0, startPosition + distance * ease);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  requestAnimationFrame(animation);
}

// 네비게이션 링크 클릭 (같은 페이지 내 #섹션만 부드럽게 스크롤)
document.querySelectorAll('.hash-nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const targetSection = document.querySelector(href);
    if (targetSection) smoothScrollTo(targetSection, 500);
  });
});

const panels = document.querySelectorAll('.panel');

// 이미지 모달
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const modalClose = document.querySelector('.modal-close');
let savedScrollPosition = 0;

const vizImages = {
  'powerbi': {
    src: 'image/powerbi.png',
    caption: 'Power BI 작업 예시'
  },
  'spotfire': {
    src: 'image/spotfire.png',
    caption: 'Spotfire 작업 예시'
  },
  'qgis': {
    src: 'image/qgis.png',
    caption: 'QGIS 작업 예시'
  }
};

document.querySelectorAll('.viz-chip').forEach(chip => {
  chip.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const vizData = vizImages[this.getAttribute('data-viz')];
    if (vizData) {
      savedScrollPosition = window.pageYOffset;
      modal.style.display = 'block';
      modalImg.src = vizData.src;
      modalCaption.textContent = vizData.caption;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollPosition}px`;
      document.body.style.width = '100%';
    }
  });
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', function(e) {
  if (e.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});

function closeModal() {
  modal.style.display = 'none';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, savedScrollPosition);
}

// 휠 스크롤 페이지 이동
let isScrolling = false;
let currentPanelIndex = 0;

function getCurrentPanel() {
  let closestIndex = 0;
  let minDistance = Infinity;
  
  panels.forEach((panel, index) => {
    const rect = panel.getBoundingClientRect();
    const distance = Math.abs(rect.top);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  
  return closestIndex;
}

// 페이지 고정 스크롤 (데스크톱만)
window.addEventListener('wheel', (e) => {
  if (window.innerWidth <= 1024) return;
  if (modal.style.display === 'block') return;
  if (isScrolling) {
    e.preventDefault();
    return;
  }
  
  currentPanelIndex = getCurrentPanel();
  
  if (e.deltaY > 0 && currentPanelIndex < panels.length - 1) {
    e.preventDefault();
    isScrolling = true;
    smoothScrollTo(panels[currentPanelIndex + 1], 1000);
    setTimeout(() => { isScrolling = false; }, 1100);
  } else if (e.deltaY < 0 && currentPanelIndex > 0) {
    e.preventDefault();
    isScrolling = true;
    smoothScrollTo(panels[currentPanelIndex - 1], 1000);
    setTimeout(() => { isScrolling = false; }, 1100);
  }
}, { passive: false });

// 타임라인 터치
if (window.innerWidth <= 1024) {
  const timelineBars = document.querySelectorAll('.tbar');
  
  timelineBars.forEach(bar => {
    bar.addEventListener('click', function(e) {
      e.stopPropagation();
      timelineBars.forEach(b => { if (b !== this) b.classList.remove('active'); });
      this.classList.toggle('active');
    });
  });
  
  document.addEventListener('click', function() {
    timelineBars.forEach(b => b.classList.remove('active'));
  });
}

// 화면 크기 변경
window.addEventListener('resize', function() {
  if (window.innerWidth > 1024) {
    document.querySelectorAll('.tbar').forEach(bar => {
      bar.classList.remove('active');
    });
  }
});

