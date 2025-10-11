// 페이지 로드 시 해시가 있으면 해당 섹션으로 스크롤
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'auto' });
      }
    }, 100);
  }
});

// Intersection Observer로 스크롤 애니메이션 구현
// 섹션 단위로 관찰해서 항상 같은 순서로 애니메이션 적용
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
      // 섹션이 화면에 들어오면 모든 자식 요소에 visible 클래스 추가
      animatedElements.forEach(el => {
        el.classList.add('visible');
      });
    } else {
      // 섹션이 화면에서 나가면 모든 자식 요소에서 visible 클래스 제거
      animatedElements.forEach(el => {
        el.classList.remove('visible');
      });
    }
  });
}, sectionObserverOptions);

// 모든 섹션(.panel)을 관찰
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.panel');
  sections.forEach(section => {
    sectionAnimObserver.observe(section);
  });
});

// 현재 보이는 섹션에 따라 네비게이션 메뉴 활성화
const navSections = document.querySelectorAll('.panel');
const navLinks = document.querySelectorAll('.hash-nav a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const sectionId = entry.target.id;
      
      // 모든 링크에서 active 클래스 제거
      navLinks.forEach(link => link.classList.remove('active'));
      
      // 현재 섹션에 해당하는 링크에 active 클래스 추가
      const activeLink = document.querySelector(`.hash-nav a[href="#${sectionId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  });
}, {
  root: null,
  rootMargin: '-50% 0px -50% 0px',
  threshold: 0
});

// 모든 섹션 관찰
navSections.forEach(section => {
  sectionObserver.observe(section);
});

// 부드러운 스크롤 함수
function smoothScrollTo(target, duration = 600) {
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // easeInOutCubic 함수로 부드러운 움직임
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    window.scrollTo(0, startPosition + distance * ease);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

// 네비게이션 링크 클릭 시 빠른 스크롤
document.querySelectorAll('.hash-nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      smoothScrollTo(targetSection, 500); // 0.5초 동안 빠르게 이동
    }
  });
});

const panels = document.querySelectorAll('.panel');

// Visualization 이미지 모달 기능
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const modalClose = document.querySelector('.modal-close');
let savedScrollPosition = 0;

// 이미지 경로 매핑 (image 폴더에 해당 이미지들이 있어야 함)
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

// viz-chip 클릭 이벤트
document.querySelectorAll('.viz-chip').forEach(chip => {
  chip.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const vizType = this.getAttribute('data-viz');
    const vizData = vizImages[vizType];
    
    if (vizData) {
      // 현재 스크롤 위치 저장
      savedScrollPosition = window.pageYOffset;
      
      modal.style.display = 'block';
      modalImg.src = vizData.src;
      modalCaption.textContent = vizData.caption;
      
      // body를 고정하여 스크롤 방지
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollPosition}px`;
      document.body.style.width = '100%';
    }
  });
});

// 모달 닫기
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', function(e) {
  if (e.target === modal) {
    closeModal();
  }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});

function closeModal() {
  modal.style.display = 'none';
  
  // body 고정 해제 및 스크롤 위치 복원
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, savedScrollPosition);
}

// 휠 스크롤로 페이지 이동 (천천히)
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

window.addEventListener('wheel', (e) => {
  // 모달이 열려있으면 페이지 이동하지 않음
  if (modal.style.display === 'block') {
    return;
  }
  
  if (isScrolling) {
    e.preventDefault();
    return;
  }
  
  currentPanelIndex = getCurrentPanel();
  
  // 스크롤 방향에 따라 다음/이전 패널로 이동
  if (e.deltaY > 0 && currentPanelIndex < panels.length - 1) {
    // 아래로 스크롤
    e.preventDefault();
    isScrolling = true;
    smoothScrollTo(panels[currentPanelIndex + 1], 1000); // 1초 동안 천천히
    setTimeout(() => { isScrolling = false; }, 1100);
  } else if (e.deltaY < 0 && currentPanelIndex > 0) {
    // 위로 스크롤
    e.preventDefault();
    isScrolling = true;
    smoothScrollTo(panels[currentPanelIndex - 1], 1000); // 1초 동안 천천히
    setTimeout(() => { isScrolling = false; }, 1100);
  }
}, { passive: false });

