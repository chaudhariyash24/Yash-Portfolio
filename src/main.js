import { ThreeScene } from './three-scene.js';
import { gsap } from 'gsap';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize WebGL 3D Scene
  const threeEngine = new ThreeScene();

  // (Typing effect removed to achieve a clean normal profile look)

  // 3. Connect Skill Tag Hover Impulses to WebGL Nodes
  const skillTags = document.querySelectorAll('.skill-tag');
  skillTags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      const nodeId = tag.getAttribute('data-node');
      threeEngine.pulseSkillNode(nodeId);
    });
  });

  // 4. Interactive 3D Card Tilt & Glare Effect (Dynamic 3D properties)
  const tiltCards = document.querySelectorAll('.glass-panel, .project-matrix-card, .skill-category-card, .console-box');
  
  tiltCards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    // Glare & tilt variables initialized in mouse move event
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const mouseXPercentage = (x / rect.width) * 100;
      const mouseYPercentage = (y / rect.height) * 100;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const tiltXVal = (yc - y) / yc; // Range [-1, 1]
      const tiltYVal = -(xc - x) / xc; // Range [-1, 1]

      card.style.setProperty('--mouse-x', `${mouseXPercentage}%`);
      card.style.setProperty('--mouse-y', `${mouseYPercentage}%`);
      card.style.setProperty('--tilt-x', tiltXVal);
      card.style.setProperty('--tilt-y', tiltYVal);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--tilt-x', '0');
      card.style.setProperty('--tilt-y', '0');
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });

  // 5. Scroll Section Highlighting in Navbar
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 250)) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });

    // Add scrolled class to navbar
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    }
  });

  // 6. Hamburger Menu Trigger
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navLinks');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
      
      const lines = hamburger.querySelectorAll('span');
      if (hamburger.classList.contains('active')) {
        gsap.to(lines[0], { rotate: 45, y: 7, duration: 0.2 });
        gsap.to(lines[1], { opacity: 0, duration: 0.2 });
        gsap.to(lines[2], { rotate: -45, y: -7, duration: 0.2 });
      } else {
        gsap.to(lines[0], { rotate: 0, y: 0, duration: 0.2 });
        gsap.to(lines[1], { opacity: 1, duration: 0.2 });
        gsap.to(lines[2], { rotate: 0, y: 0, duration: 0.2 });
      }
    });
    
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        const lines = hamburger.querySelectorAll('span');
        gsap.to(lines[0], { rotate: 0, y: 0, duration: 0.2 });
        gsap.to(lines[1], { opacity: 1, duration: 0.2 });
        gsap.to(lines[2], { rotate: 0, y: 0, duration: 0.2 });
      });
    });
  }

  // 7. Stats Counter Animation
  const counters = document.querySelectorAll('.counter');
  let hasCounted = false;

  const countUp = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps

      let current = 0;
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.innerText = Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target;
        }
      };
      updateCounter();
    });
  };

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasCounted) {
        hasCounted = true;
        countUp();
      }
    }, { threshold: 0.5 });
    
    observer.observe(statsSection);
  }
});
