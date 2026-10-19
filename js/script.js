'use strict';

// ApriLand interactions: mystery-block power-ups, an accessible quiz, and navigation helpers.
const powerupMessages = [
  '🍄 Super Mushroom! Keep growing your skills.',
  '⭐ Star power! Keep building your creative IT skills.',
  '🪙 Coin collected! One more step forward.',
  '🏁 Level up! You are ready for the next challenge.',
  '🌼 Fire Flower! Your next useful project starts with an idea.'
];
let powerupIndex = 0;
let toastTimer;
let audioContext;

function playCoinSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext = audioContext || new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(988, now);
    oscillator.frequency.setValueAtTime(1319, now + 0.075);
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.23);
  } catch (error) {
    // Audio is decorative only
  }
}

function showPowerup() {
  const toast = document.getElementById('powerup-toast');
  const block = document.getElementById('floating-block');
  const heroButton = document.getElementById('hero-powerup');
  const message = powerupMessages[powerupIndex % powerupMessages.length];
  powerupIndex += 1;
  playCoinSound();
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
  }
  [block, heroButton].forEach((element) => {
    if (!element) return;
    element.animate(
      [{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-8px) scale(1.08)' }, { transform: 'translateY(0) scale(1)' }],
      { duration: 260, easing: 'ease-out' }
    );
  });
  const coinPop = document.getElementById('coin-pop');
  if (coinPop) {
    coinPop.classList.remove('show');
    void coinPop.offsetWidth;
    coinPop.classList.add('show');
  }
}

const quizData = [
  {
    question: 'Which item makes Mario temporarily invincible?',
    options: ['Super Mushroom', 'Super Star', 'Fire Flower', 'Green Shell'],
    answer: 1,
    explanation: 'The Super Star grants temporary invincibility.'
  },
  {
    question: 'What is Mario most famously known for doing?',
    options: ['Plumbing', 'Painting', 'Cooking', 'Flying airplanes'],
    answer: 0,
    explanation: 'Mario is famously known as a plumber.'
  },
  {
    question: 'Which language is commonly used to add interactivity to a web page?',
    options: ['HTML', 'CSS', 'JavaScript', 'SQL only'],
    answer: 2,
    explanation: 'JavaScript can respond to clicks, update content, and add interaction.'
  },
  {
    question: 'Which is one of April’s interests outside academics?',
    options: ['Pickleball', 'Pottery', 'Car racing', 'Gardening'],
    answer: 0,
    explanation: 'April enjoys pickleball, music, and movies outside academics.'
  },
  {
    question: 'What is the main goal of this personal website?',
    options: ['Sell power-ups', 'Replace all video games', 'Share April’s story and interests', 'Teach advanced plumbing'],
    answer: 2,
    explanation: 'ApriLand combines a personal portfolio with playful interactions.'
  }
];

let currentQuestion = 0;
let score = 0;
let hasAnswered = false;
const LETTERS = ['A', 'B', 'C', 'D'];

function byId(id) { return document.getElementById(id); }

function updateScore() {
  if (byId('score-val')) byId('score-val').textContent = String(score);
  if (byId('score-meter-fill')) byId('score-meter-fill').style.width = `${(score / (quizData.length * 100)) * 100}%`;
}

function setQuizProgress() {
  const percentage = (currentQuestion / quizData.length) * 100;
  if (byId('quiz-progress-fill')) byId('quiz-progress-fill').style.width = `${percentage}%`;
  if (byId('quiz-count')) byId('quiz-count').textContent = `QUESTION ${Math.min(currentQuestion + 1, quizData.length)} / ${quizData.length}`;
  if (byId('question-number')) byId('question-number').textContent = String(currentQuestion + 1).padStart(2, '0');
}

function loadQuestion() {
  const question = quizData[currentQuestion];
  const questionTitle = byId('quiz-question');
  const optionsContainer = byId('quiz-options');
  const feedback = byId('quiz-feedback');
  const nextButton = byId('quiz-next');
  if (!question || !optionsContainer || !questionTitle) return;

  hasAnswered = false;
  questionTitle.textContent = question.question;
  optionsContainer.replaceChildren();
  feedback.textContent = '';
  feedback.className = '';
  nextButton.disabled = true;
  nextButton.innerHTML = currentQuestion === quizData.length - 1 ? 'See my rank <span aria-hidden="true">→</span>' : 'Next question <span aria-hidden="true">→</span>';

  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'quiz-option';
    button.type = 'button';
    button.innerHTML = `<span class="option-key">${LETTERS[index]}</span><span></span>`;
    button.querySelector('span:last-child').textContent = option;
    button.addEventListener('click', () => selectAnswer(index));
    optionsContainer.appendChild(button);
  });
  const result = byId('quiz-result');
  if (result) result.hidden = true;
  questionTitle.hidden = false;
  optionsContainer.hidden = false;
  byId('quiz-card').classList.remove('quiz-finished');
  const questionLabel = document.querySelector('.question-label');
  if (questionLabel) questionLabel.hidden = false;
  const quizTop = document.querySelector('.quiz-top');
  if (quizTop) quizTop.hidden = false;
  const progress = document.querySelector('.quiz-progress');
  if (progress) progress.hidden = false;
  const bottom = document.querySelector('.quiz-bottom');
  if (bottom) bottom.hidden = false;
  setQuizProgress();
}

function selectAnswer(selectedIndex) {
  if (hasAnswered) return;
  hasAnswered = true;
  const question = quizData[currentQuestion];
  const buttons = Array.from(byId('quiz-options').querySelectorAll('.quiz-option'));
  const feedback = byId('quiz-feedback');
  const isCorrect = selectedIndex === question.answer;
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.answer) button.classList.add('correct');
    else if (index === selectedIndex) button.classList.add('incorrect');
  });

  if (isCorrect) {
    score += 100;
    feedback.textContent = `✓ ${question.explanation} +100 XP`;
    feedback.classList.add('correct-text');
    playCoinSound();
    const coinPop = byId('coin-pop');
    if (coinPop) {
      coinPop.classList.remove('show');
      void coinPop.offsetWidth;
      coinPop.classList.add('show');
    }
  } else {
    feedback.textContent = `Not quite. ${question.explanation}`;
    feedback.classList.add('incorrect-text');
  }
  updateScore();
  byId('quiz-next').disabled = false;
  byId('quiz-next').focus({ preventScroll: true });
}

function showQuizResult() {
  byId('quiz-question').hidden = true;
  byId('quiz-options').hidden = true;
  byId('quiz-feedback').textContent = '';
  byId('quiz-next').disabled = true;
  const bottom = document.querySelector('.quiz-bottom');
  if (bottom) bottom.hidden = true;
  const questionLabel = document.querySelector('.question-label');
  if (questionLabel) questionLabel.hidden = true;
  const quizTop = document.querySelector('.quiz-top');
  if (quizTop) quizTop.hidden = true;
  const progress = document.querySelector('.quiz-progress');
  if (progress) progress.hidden = true;
  byId('quiz-result').hidden = false;
  byId('quiz-card').classList.add('quiz-finished');
  byId('quiz-progress-fill').style.width = '100%';
  byId('quiz-count').textContent = 'STAGE CLEAR';

  let title = 'Keep exploring!';
  let copy = `You earned ${score} out of ${quizData.length * 100} XP. Every attempt is practice for the next level.`;
  if (score === quizData.length * 100) {
    title = 'Super Star Player!';
    copy = `Perfect run! You collected all ${score} XP. The Mushroom Kingdom salutes you.`;
  } else if (score >= 300) {
    title = 'Power-Up Pro!';
    copy = `Nice work! You earned ${score} XP. You're getting the hang of this world.`;
  } else if (score >= 100) {
    title = 'Level Cleared!';
  }
  byId('result-title').textContent = title;
  byId('result-copy').textContent = copy;
  byId('play-again').focus({ preventScroll: true });
}

function nextQuestion() {
  if (!hasAnswered) return;
  if (currentQuestion === quizData.length - 1) {
    showQuizResult();
    return;
  }
  currentQuestion += 1;
  loadQuestion();
  byId('quiz-question').focus?.({ preventScroll: true });
}

function resetQuiz() {
  currentQuestion = 0;
  score = 0;
  updateScore();
  loadQuestion();
}

function setupAboutWorld() {
  const questionBlock = byId('about-question-block');
  const powerupMessage = byId('about-powerup-message');
  const coinButtons = Array.from(document.querySelectorAll('.world-coin[data-coin]'));
  const coinCount = byId('about-coin-count');
  const coinTotal = byId('about-coin-total');
  const discovery = byId('about-coin-discovery');
  const discoveryTitle = byId('about-coin-title');
  const discoveryMessage = byId('about-coin-message');

  const playerPowerups = [
    '🍄 Mushroom power-up: I love exploring programming, web development, databases, and creative design.',
    '⭐ Star power: Creativity, continuous learning, and problem-solving help me tackle a new challenge.',
    '🏓 Bonus life: Pickleball, music, and movies help me recharge outside academics.',
    '🏰 Final quest: I want to become a skilled IT professional and build useful, accessible applications.'
  ];
  let powerupIndex = 0;

  questionBlock?.addEventListener('click', () => {
    if (!powerupMessage) return;
    playCoinSound();
    powerupMessage.textContent = playerPowerups[powerupIndex % playerPowerups.length];
    powerupIndex += 1;
    questionBlock.classList.remove('is-hit');
    void questionBlock.offsetWidth;
    questionBlock.classList.add('is-hit');
  });

  const coinFacts = [
    {
      title: 'Coin 1 unlocked: What I love learning',
      message: 'I’m interested in programming, web development, databases, and creative design—and how they can work together to make useful digital experiences.'
    },
    {
      title: 'Coin 2 unlocked: My power-up trio',
      message: 'Creativity, continuous learning, and problem-solving are the values I try to bring into my studies and projects.'
    },
    {
      title: 'Coin 3 unlocked: The big goal',
      message: 'I want to grow into a skilled IT professional who can build meaningful, accessible applications that help people.'
    }
  ];
  let collectedCoins = 0;

  coinButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      const factIndex = Number(button.dataset.coin);
      const fact = coinFacts[factIndex];
      if (!fact) return;

      button.disabled = true;
      button.classList.add('is-collected');
      button.innerHTML = '<span aria-hidden="true">✓</span>';
      button.setAttribute('aria-label', `Coin ${factIndex + 1} collected`);
      collectedCoins += 1;
      if (coinCount) coinCount.textContent = String(collectedCoins).padStart(2, '0');
      if (coinTotal) coinTotal.textContent = String(collectedCoins);
      if (discoveryTitle) discoveryTitle.textContent = collectedCoins === coinButtons.length ? 'WORLD CLEAR! All coins collected!' : fact.title;
      if (discoveryMessage) {
        discoveryMessage.textContent = collectedCoins === coinButtons.length
          ? `${fact.message} You found all three coins—thanks for exploring my world!`
          : fact.message;
      }
      if (discovery) {
        discovery.classList.remove('coin-found');
        void discovery.offsetWidth;
        discovery.classList.add('coin-found');
      }
      playCoinSound();
    });
  });
}

function setupMenu() {
  const toggle = byId('menu-toggle');
  const links = byId('nav-links');
  if (!toggle || !links) return;
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    links.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    links.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });
  links.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
}

function setupScrollEffects() {
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const progress = byId('scroll-progress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateOnScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progressPercent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${progressPercent}%`;
    let currentId = 'home';
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 160) currentId = section.id;
    });
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', updateOnScroll, { passive: true });
  window.addEventListener('resize', updateOnScroll);
  updateOnScroll();

  const revealTargets = document.querySelectorAll('.about-story, .player-card, .milestone, .world-checkpoint, .about-coin-discovery, .skill-card, .favorite-card, .goal-card, .game-side, .quiz-card, .contact-card');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((element, index) => {
      element.classList.add('js-reveal');
      element.style.transitionDelay = `${(index % 3) * 70}ms`;
      observer.observe(element);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupAboutWorld();
  byId('hero-powerup')?.addEventListener('click', showPowerup);
  byId('floating-block')?.addEventListener('click', showPowerup);
  byId('quiz-next')?.addEventListener('click', nextQuestion);
  byId('reset-quiz')?.addEventListener('click', resetQuiz);
  byId('play-again')?.addEventListener('click', resetQuiz);
  byId('year').textContent = String(new Date().getFullYear());
  setupMenu();
  setupScrollEffects();
  updateScore();
  loadQuestion();
});

// Back to Top button
document.addEventListener("DOMContentLoaded", () => {
    const backToTop = document.querySelector(".back-to-top");

    if (!backToTop) return;

    backToTop.addEventListener("click", (event) => {
        event.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});