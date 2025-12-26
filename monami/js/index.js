// a 태그 기본 동작 방지 (전역)
document.addEventListener('click', function(e) {
  const link = e.target.closest('a[href="#"]');
  if (link) {
    e.preventDefault();
  }
});


/* =========================
   0) GSAP/ScrollTrigger 등록
   ========================= */
gsap.registerPlugin(ScrollTrigger);

/* =========================
   1) header height → CSS 변수
   ========================= */
function updateHeaderHeightVar() {
  const header = document.querySelector("header");
  const h = header ? header.offsetHeight : 0;
  document.documentElement.style.setProperty("--header-h", `${h}px`);
}

/* =========================
   2) TEXT FILL (최종 해결본)
   - pin/refresh 이후에도 항상 0%에서 시작
   - 기존 트리거 kill → 재생성
   ========================= */
function initTextFill() {
  // ✅ 이전 텍스트 fill 트리거 전부 제거
  ScrollTrigger.getAll().forEach((st) => {
    if (st.vars && st.vars.id && String(st.vars.id).startsWith("textFill-")) {
      st.kill();
    }
  });

  const titles = gsap.utils.toArray(".main-title, .page-title");

  titles.forEach((title, idx) => {
    const lines = title.querySelectorAll(".text-line");
    const targets = lines.length ? Array.from(lines) : [title];

    // ✅ 시작값 고정 (중간값/100%로 굳는 현상 방지)
    gsap.set(targets, { backgroundSize: "0% 100%" });

    // ✅ 섹션별 end 커스텀 (네가 쓰던 로직 유지)
    const isProduct1 = title.closest(".product-1");
    const endValue = isProduct1 ? "+=600" : "top 10%";

    gsap.timeline({
      scrollTrigger: {
        id: `textFill-${idx}`,
        trigger: title,
        start: "top 90%",
        end: endValue,
        scrub: 1,
        invalidateOnRefresh: true,
        onRefreshInit: () => gsap.set(targets, { backgroundSize: "0% 100%" }),
        // markers: true
      }
    }).to(targets, {
      backgroundSize: "100% 100%",
      ease: "none",
      stagger: 0.25
    });
  });
}

/* =========================
   3) DOM 준비 후 실행
   ========================= */
document.addEventListener("DOMContentLoaded", () => {

  // ✅ 최초 1회 세팅
  updateHeaderHeightVar();

  /* =========================
     HEADER show/hide (ScrollTrigger)
     ========================= */
  const mainHeader = document.querySelector("header");

  if (mainHeader) {
    ScrollTrigger.create({
      trigger: ".intro-video",
      start: "top 50%",
      onEnter: () => mainHeader.classList.add("active"),
      onLeaveBack: () => mainHeader.classList.remove("active"),
    });

    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (mainHeader.classList.contains("active")) {
          if (self.direction === 1) mainHeader.classList.add("up");
          else mainHeader.classList.remove("up");
        }
      }
    });
  }

  /* =========================
     MOBILE MENU
     ========================= */
  const menuBtn = document.querySelector(".menu");
  const menuOpen = document.querySelector(".menuOpen");
  const closeBtn = document.querySelector(".closeBtn");

  if (menuBtn && menuOpen) {
    menuBtn.addEventListener("click", () => menuOpen.classList.add("on"));
  }
  if (closeBtn && menuOpen) {
    closeBtn.addEventListener("click", () => menuOpen.classList.remove("on"));
  }

  /* =========================
     리사이즈 대응 (통합 1개만)
     ========================= */
  window.addEventListener("resize", () => {
    updateHeaderHeightVar();
    ScrollTrigger.refresh();
    initTextFill(); // ✅ 리사이즈에도 텍스트 fill 안정화
  });

  /* =========================
     1) 비디오 clip-path
     ========================= */
  gsap.timeline({
    scrollTrigger: {
      trigger: ".intro-video",
      start: "0% 80%",
      end: "100% 100%",
      scrub: 1,
    }
  })
  .fromTo(".videoWrap",
    { clipPath: "inset(60% round 30%)" },
    { clipPath: "inset(0% round 0%)", ease: "none" }
  );

  /* =========================
     2) 인트로 텍스트 교체 + 사라짐 처리
     ========================= */
  const fixedText = document.querySelector(".textAni h1");
  const steps = gsap.utils.toArray(".textAni .text");

  if (fixedText && steps.length) {
    steps.forEach((elem) => {
      const txt = elem.dataset.text;
      ScrollTrigger.create({
        trigger: elem,
        start: "top center",
        end: "bottom center",
        onEnter: () => (fixedText.innerText = txt),
        onEnterBack: () => (fixedText.innerText = txt),
      });
    });
  }

  gsap.to([".textAni h1", ".center-svg"], {
    scrollTrigger: {
      trigger: ".intro-video",
      start: "top 90%",
      end: "top 60%",
      scrub: true,
    },
    opacity: 0,
    pointerEvents: "none"
  });

  /* =========================
     3) 인트로 중앙 선 내려오기
     ========================= */
  const introPath = document.querySelector("#linePath");
  if (introPath && steps.length) {
    const pathLen = introPath.getTotalLength();
    const stepLen = pathLen / (steps.length * 2.4);

    gsap.set(introPath, { strokeDasharray: pathLen, strokeDashoffset: pathLen, opacity: 0 });

    steps.forEach((elem, i) => {
      ScrollTrigger.create({
        trigger: elem,
        start: "top 55%",
        onEnter: (self) => {
          if (self.direction === 1) {
            if (i === 0) gsap.set(introPath, { opacity: 1 });
            gsap.to(introPath, { strokeDashoffset: pathLen - stepLen * (i + 1), duration: 0.5 });
          }
        },
        onEnterBack: () => {
          gsap.to(introPath, { strokeDashoffset: pathLen - stepLen * i, duration: 0.5 });
        }
      });
    });
  }

  /* =========================
     4) 텍스트 채우기 애니메이션 실행 (최초)
     ========================= */
  initTextFill();

  /* =========================
     MAN 섹션: SVG 라인 드로잉
     ========================= */
  const manSection = document.querySelector(".man");
  const path = document.querySelector("#scroll-path");

  if (manSection && path) {
    const pathLength = path.getTotalLength();

    const initPath = () => {
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength
      });
    };

    initPath();

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: manSection,
        start: "top 0%",
        end: "bottom 50%",
        scrub: true,
        invalidateOnRefresh: true,
        onRefreshInit: initPath
        // markers: true
      }
    });
  }

  /* =========================
     MAN 섹션: 라이트 토글
     ========================= */
  const lightEl = document.querySelector(".man .img-light");
  if (lightEl) {
    gsap.timeline({
      scrollTrigger: {
        trigger: ".man",
        start: "top 25%",
        end: "bottom 65%",
        scrub: 1.5
      }
    })
    .to(lightEl, { opacity: 1, ease: "sine.inOut" })
    .to(lightEl, { opacity: 0, ease: "sine.inOut" });
  }

  /* =========================
     FAMILY-1 섹션 선 + 라이트
     ========================= */
  const familyPath = document.querySelector(".family-1 path");
  if (familyPath) {
    const famLen = familyPath.getTotalLength();
    gsap.set(familyPath, { strokeDasharray: famLen, strokeDashoffset: famLen });
    gsap.to(familyPath, {
      strokeDashoffset: 0,
      scrollTrigger: {
        trigger: ".family-1",
        start: "top top",
        end: "bottom 80%",
        scrub: 1
      }
    });
  }

  gsap.timeline({
    scrollTrigger: {
      trigger: ".family-1",
      start: "top 70%",
      end: "bottom 30%",
      scrub: 1
    }
  })
  .fromTo(".family-1 .img-light", { opacity: 0 }, { opacity: 1, ease: "sine.inOut" })
  .to(".family-1 .img-light", { opacity: 0, ease: "sine.inOut" });

  /* =========================
     6) FAMILY-2 (GSAP 가로 스크롤 + 포커스 밝기 + 768↓ 스택)
     ========================= */
  ScrollTrigger.matchMedia({

    /* 💻 768px 이상: pin + 가로 이동 + 포커스 카드 밝아짐 */
    "(min-width: 768px)": function () {

      const section = document.querySelector(".family-2");
      const track   = document.querySelector(".family-2 .list");  // ✅ 움직일 UL
      const cards   = gsap.utils.toArray(".family-2 .list > li"); // ✅ 카드들

      if (!section || !track || !cards.length) return;

      // ✅ 이전 실행 잔상 정리
      gsap.set(track, { clearProps: "transform" });
      cards.forEach(li => li.classList.remove("is-focus"));

      // ✅ focusX: 화면 기준 고정 포커스 위치
      const getFocusX = () => window.innerWidth * 0.28;

      // ✅ 마지막 카드 "센터"가 focusX에 오도록 필요한 이동량
      const getMaxX = () => {
        const focusX = getFocusX();
        const last = cards[cards.length - 1];
        const lastCenter = last.offsetLeft + last.offsetWidth / 2;
        const need = lastCenter - focusX;
        return Math.max(0, need);
      };

      // ✅ 현재 focusX에 가장 가까운 카드에 is-focus 부여
      function updateFocusCard() {
        const focusX = getFocusX();
        let best = null;
        let bestDist = Infinity;

        cards.forEach((li) => {
          const r = li.getBoundingClientRect();
          const center = r.left + r.width / 2;
          const dist = Math.abs(center - focusX);
          if (dist < bestDist) {
            bestDist = dist;
            best = li;
          }
        });

        cards.forEach(li => li.classList.toggle("is-focus", li === best));
      }

      // ✅ 가로 스크롤(핀) 타임라인
      gsap.to(track, {
        x: () => -getMaxX(),
        ease: "none",
        scrollTrigger: {
          id: "family2Scroll",
          trigger: section,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => "+=" + getMaxX(), // ✅ 핵심: 끝까지 정확히
          invalidateOnRefresh: true,
          onUpdate: updateFocusCard,
          onRefresh: updateFocusCard
          // markers: true
        }
      });

      // ✅ pin 세팅 직후: 트리거 좌표 + 텍스트 fill + 포커스 재계산 (한 번에)
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        initTextFill();     // ✅ 다른 섹션 title fill 다시 살아남
        updateFocusCard();  // ✅ 포커스도 즉시 갱신
      });
    },

    /* 📱 768px 미만: pin 제거 + 세로 스택 */
    "(max-width: 767px)": function () {

      // ✅ family-2 ScrollTrigger만 제거 (id로)
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars && st.vars.id === "family2Scroll") st.kill();
      });

      // ✅ transform 초기화
      gsap.set(".family-2 .list", { clearProps: "transform" });

      // ✅ 밝기 클래스 제거
      document.querySelectorAll(".family-2 .list > li")
        .forEach(li => li.classList.remove("is-focus"));

      // ✅ 모바일에서도 텍스트 fill 정상 유지
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        initTextFill();
      });
    }

  });

  /* =========================
     product → youtube SVG 선
     ========================= */
  const productYoutubePath = document.querySelector("#product-youtube-path");
  if (productYoutubePath) {
    const pathLength = productYoutubePath.getTotalLength();

    gsap.set(productYoutubePath, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
      visibility: "visible"
    });

    gsap.to(productYoutubePath, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".product-1",
        start: "top top",
        endTrigger: ".youtube",
        end: "bottom 100%",
        scrub: 1
      }
    });
  }


/* 8. youtube swiper 수정 */
    const swiper = new Swiper('.swiper.youtube', {
            // 공통 설정
            slidesPerView: 'auto',
            spaceBetween: 24,      
            loop: true,            
            
            // ★ 수정 1: 복사본 개수를 넉넉하게 늘림 (끊김 방지 안전장치)
            loopedSlides: 10,
            
            // 텍스트 선명하게
            roundLengths: true,
            observer: true,
            observeParents: true,
            speed: 800,
            
            // 반응형 설정
            breakpoints: {
                320: {
                    centeredSlides: false, // 왼쪽 정렬
                    spaceBetween: 24,
                },
                1400: {
                    centeredSlides: true,  // 중앙 정렬
                    spaceBetween: 48,
                }
            },

            // ★ 수정 2: 화면 바뀔 때 'Loop'를 부시고 다시 만듦 ★
            on: {
                init: function() {
                    this.isPc = window.innerWidth >= 1400;
                    if (this.isPc) {
                        this.slideToLoop(1, 0); 
                    } else {
                        this.slideToLoop(0, 0); 
                    }
                },
                
                resize: function() {
                    const currentIsPc = window.innerWidth >= 1400;

                    // PC <-> 모바일 상태가 변했을 때만 실행
                    if (this.isPc !== currentIsPc) {
                        this.isPc = currentIsPc;

                        // ★ 핵심 해결책: 기존 루프를 제거하고 다시 생성 ★
                        // 이걸 해야 줄어든 카드 크기에 맞춰서 왼쪽 복사본이 예쁘게 다시 깔립니다.
                        this.loopDestroy();
                        this.loopCreate();
                        this.update();

                        if (this.isPc) {
                            // 모바일 -> PC: 2번 카드(index 1) 중앙으로
                            this.slideToLoop(1, 0); 
                        } else {
                            // PC -> 모바일: 1번 카드(index 0) 맨 앞으로
                            this.slideToLoop(0, 0); 
                        }
                    }
                }
            }
        });






});
