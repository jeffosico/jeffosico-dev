/* ============================================================
   Jeff Osico Portfolio - Main JavaScript
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     Theme Toggle
  ---------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }

  const savedTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'dark');
  setTheme(savedTheme);

  themeToggle.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* ----------------------------------------------------------
     Navbar Scroll Effect
  ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  function handleNavScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ----------------------------------------------------------
     Active Nav Link on Scroll
  ---------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 200;
    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ----------------------------------------------------------
     Mobile Navigation
  ---------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinksContainer = document.getElementById('nav-links');

  mobileToggle.addEventListener('click', function () {
    mobileToggle.classList.toggle('active');
    navLinksContainer.classList.toggle('mobile-open');
    document.body.style.overflow = navLinksContainer.classList.contains('mobile-open') ? 'hidden' : '';
  });

  navLinksContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav-link')) {
      mobileToggle.classList.remove('active');
      navLinksContainer.classList.remove('mobile-open');
      document.body.style.overflow = '';
    }
  });

  /* ----------------------------------------------------------
     Scroll Animations
  ---------------------------------------------------------- */
  const animateElements = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(function () {
          entry.target.classList.add('visible');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animateElements.forEach(function (el) { observer.observe(el); });

  /* ----------------------------------------------------------
     Back to Top
  ---------------------------------------------------------- */
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', function () {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------
     Lazy Load Images
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    var imgs = document.querySelectorAll('img[loading="lazy"]');
    imgs.forEach(function (img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function () {
          img.classList.add('loaded');
        });
      }
    });
  });

  /* ----------------------------------------------------------
     Load Projects from JSON
  ---------------------------------------------------------- */
  // Determine base path for assets
  var basePath = '';
  var isSubPage = window.location.pathname.includes('/portfolio/');
  if (isSubPage) basePath = '../';

  function loadProjects() {
    var projects = window.PROJECTS || [];
    if (!projects.length) {
      console.error('No projects data found. Ensure data/projects.js is loaded.');
      return;
    }
    renderFeaturedProjects(projects);
    renderProjectsGrid(projects);
    setupFilters();
  }

  /* ----------------------------------------------------------
     Render Featured Projects
  ---------------------------------------------------------- */
  function renderFeaturedProjects(projects) {
    var container = document.getElementById('featured-projects');
    if (!container) return;

    var featured = projects.filter(function (p) { return p.featured; }).slice(0, 6);

    featured.forEach(function (project) {
      var card = document.createElement('a');
      card.className = 'featured-card';
      card.href = basePath + 'portfolio/' + project.slug + '.html';

      var techHTML = project.techStack.slice(0, 4).map(function (t) {
        return '<span class="tech-pill">' + t + '</span>';
      }).join('');

      card.innerHTML =
        '<div class="featured-card-image">' +
          '<img src="' + basePath + project.thumbnail + '" alt="' + project.title + '" loading="lazy">' +
        '</div>' +
        '<div class="featured-card-body">' +
          '<h3>' + project.title + '</h3>' +
          '<p>' + project.shortDescription + '</p>' +
          '<div class="featured-card-tech">' + techHTML + '</div>' +
        '</div>';

      container.appendChild(card);
    });
  }

  /* ----------------------------------------------------------
     Sort Projects
  ---------------------------------------------------------- */
  function parseProjectDate(dateStr) {
    var d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  function sortProjects(projects, sortBy) {
    var sorted = projects.slice();
    switch (sortBy) {
      case 'name-asc':
        sorted.sort(function (a, b) { return a.title.localeCompare(b.title); });
        break;
      case 'name-desc':
        sorted.sort(function (a, b) { return b.title.localeCompare(a.title); });
        break;
      case 'date-newest':
        sorted.sort(function (a, b) { return parseProjectDate(b.date) - parseProjectDate(a.date); });
        break;
      case 'date-oldest':
        sorted.sort(function (a, b) { return parseProjectDate(a.date) - parseProjectDate(b.date); });
        break;
    }
    return sorted;
  }

  /* ----------------------------------------------------------
     Render All Projects Grid
  ---------------------------------------------------------- */
  var allProjects = [];

  function renderProjectsGrid(projects) {
    var container = document.getElementById('projects-grid');
    if (!container) return;

    allProjects = projects;
    var sortSelect = document.getElementById('sort-select');
    var sortBy = sortSelect ? sortSelect.value : 'name-asc';
    var sorted = sortProjects(projects, sortBy);

    container.innerHTML = '';

    sorted.forEach(function (project) {
      var card = document.createElement('a');
      card.className = 'project-card';
      card.href = basePath + 'portfolio/' + project.slug + '.html';
      card.setAttribute('data-categories', project.categories.join(' '));

      var techHTML = project.techStack.slice(0, 3).map(function (t) {
        return '<span class="tech-pill">' + t + '</span>';
      }).join('');

      card.innerHTML =
        '<div class="project-card-image">' +
          '<img src="' + basePath + project.thumbnail + '" alt="' + project.title + '" loading="lazy">' +
        '</div>' +
        '<div class="project-card-body">' +
          '<h3>' + project.title + '</h3>' +
          '<div class="project-card-tech">' + techHTML + '</div>' +
        '</div>' +
        '<div class="project-card-overlay">' +
          '<span>View Project</span>' +
        '</div>';

      container.appendChild(card);
    });

    // Trigger lazy load for newly added images
    var imgs = container.querySelectorAll('img[loading="lazy"]');
    imgs.forEach(function (img) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function () {
          img.classList.add('loaded');
        });
      }
    });
  }

  /* ----------------------------------------------------------
     Project Filters
  ---------------------------------------------------------- */
  function applyActiveFilter() {
    var activeBtn = document.querySelector('.filter-btn.active');
    var filter = activeBtn ? activeBtn.getAttribute('data-filter') : '*';
    var cards = document.querySelectorAll('.project-card');
    cards.forEach(function (card) {
      if (filter === '*') {
        card.classList.remove('hidden');
        card.style.display = '';
      } else {
        var cats = card.getAttribute('data-categories') || '';
        if (cats.indexOf(filter) !== -1) {
          card.classList.remove('hidden');
          card.style.display = '';
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      }
    });
  }

  function setupFilters() {
    var filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyActiveFilter();
      });
    });

    // Sort dropdown
    var sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        renderProjectsGrid(allProjects);
        applyActiveFilter();
      });
    }
  }

  /* ----------------------------------------------------------
     Contact Form
  ---------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  if (form) {
    // Get IP address
    fetch('https://api.ipify.org?format=json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var ipField = document.getElementById('ip-address');
        if (ipField) ipField.value = data.ip;
      })
      .catch(function () {});

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');
      var data = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function () {
        status.className = 'form-status success';
        status.textContent = 'Message sent! I\'ll get back to you within 24 hours.';
        form.reset();
        setTimeout(function () {
          status.className = 'form-status';
          status.style.display = 'none';
        }, 4000);
      }).catch(function () {
        status.className = 'form-status error';
        status.textContent = 'Something went wrong. Please try again or email me directly.';
      });
    });
  }

  /* ----------------------------------------------------------
     Project Detail Page - Load from JSON
  ---------------------------------------------------------- */
  function loadProjectDetail() {
    var container = document.getElementById('project-detail');
    if (!container) return;

    var slug = container.getAttribute('data-slug');
    if (!slug) return;

    var projects = window.PROJECTS || [];
    var project = projects.find(function (p) { return p.slug === slug; });
    if (!project) {
      container.innerHTML = '<div class="container" style="padding:120px 24px"><p>Project not found.</p></div>';
      return;
    }

        // Hero section
        var heroHTML =
          '<section class="project-detail-hero">' +
            '<div class="container">' +
              '<div class="breadcrumb">' +
                '<a href="../">Home</a>' +
                '<i class="fa-solid fa-chevron-right"></i>' +
                '<a href="../#projects">Projects</a>' +
                '<i class="fa-solid fa-chevron-right"></i>' +
                '<span>' + project.title + '</span>' +
              '</div>' +
              '<h1>' + project.title + '</h1>' +
              '<div class="featured-card-tech">' +
                project.techStack.map(function (t) { return '<span class="tech-pill">' + t + '</span>'; }).join('') +
              '</div>' +
              '<div class="project-detail-meta">' +
                '<div class="project-detail-meta-item"><span>Category</span><span>' + project.category + '</span></div>' +
                '<div class="project-detail-meta-item"><span>Client</span><span>' + (project.client || 'N/A') + '</span></div>' +
                '<div class="project-detail-meta-item"><span>Date</span><span>' + project.date + '</span></div>' +
                '<div class="project-detail-meta-item"><span>Type</span><span>' + project.projectType + '</span></div>' +
              '</div>' +
            '</div>' +
          '</section>';

        // Screenshots with device preview
        var images = [];
        if (project.screenshots && project.screenshots.length > 0) {
          images = project.screenshots;
        } else if (project.thumbnail) {
          images = [project.thumbnail];
        }

        var imagesHTML = images.map(function (s) {
          return '<img src="../' + s + '" alt="' + project.title + '" loading="lazy">';
        }).join('');

        var siteUrl = project.liveUrl || project.title;

        var devicePreviewHTML =
          '<div class="device-preview">' +
            '<div class="device-tabs">' +
              '<button class="device-tab active" data-device="desktop"><i class="fa-solid fa-desktop"></i><span>Desktop</span></button>' +
              '<button class="device-tab" data-device="laptop"><i class="fa-solid fa-laptop"></i><span>Laptop</span></button>' +
              '<button class="device-tab" data-device="tablet"><i class="fa-solid fa-tablet-screen-button"></i><span>Tablet</span></button>' +
              '<button class="device-tab" data-device="mobile"><i class="fa-solid fa-mobile-screen-button"></i><span>Mobile</span></button>' +
            '</div>' +
            '<div class="device-frame" data-device="desktop">' +
              '<div class="device-frame-bar">' +
                '<span class="device-frame-dot"></span>' +
                '<span class="device-frame-dot"></span>' +
                '<span class="device-frame-dot"></span>' +
                '<span class="device-frame-url">' + siteUrl + '</span>' +
              '</div>' +
              '<div class="device-frame-body">' + imagesHTML + '</div>' +
            '</div>' +
          '</div>';

        // Content section
        var contentHTML =
          '<section class="project-detail-content">' +
            '<div class="container">' +
              '<div class="project-detail-grid">' +
                '<div class="project-screenshots">' + devicePreviewHTML + '</div>' +
                '<div class="project-sidebar">' +
                  '<div class="project-info-card">' +
                    '<h3>Project Info</h3>' +
                    '<ul class="project-info-list">' +
                      '<li><strong>Category</strong><span>' + project.category + '</span></li>' +
                      '<li><strong>Technologies</strong><span>' + project.techStack.join(', ') + '</span></li>' +
                      '<li><strong>Client</strong><span>' + (project.client || 'N/A') + '</span></li>' +
                      '<li><strong>Date</strong><span>' + project.date + '</span></li>' +
                      '<li><strong>Type</strong><span>' + project.projectType + '</span></li>' +
                      (project.liveUrl ? '<li><strong>URL</strong><a href="' + project.liveUrl + '" target="_blank">' + project.liveUrl + '</a></li>' : '') +
                    '</ul>' +
                    (project.liveUrl ? '<a href="' + project.liveUrl + '" target="_blank" class="btn btn-primary btn-full" style="margin-top:16px"><span>Visit Site</span><i class="fa-solid fa-arrow-up-right-from-square"></i></a>' : '') +
                  '</div>' +
                  '<div class="project-description-card">' +
                    '<h3>About This Project</h3>' +
                    '<p>' + project.fullDescription + '</p>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</section>';

        container.innerHTML = heroHTML + contentHTML;

        // Lazy load images
        var imgs = container.querySelectorAll('img[loading="lazy"]');
        imgs.forEach(function (img) {
          if (img.complete) img.classList.add('loaded');
          else img.addEventListener('load', function () { img.classList.add('loaded'); });
        });

        // Device preview tabs
        var deviceTabs = container.querySelectorAll('.device-tab');
        var deviceFrame = container.querySelector('.device-frame');
        deviceTabs.forEach(function (tab) {
          tab.addEventListener('click', function () {
            deviceTabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            var device = tab.getAttribute('data-device');
            deviceFrame.setAttribute('data-device', device);
          });
        });
  }

  /* ----------------------------------------------------------
     Initialize
  ---------------------------------------------------------- */
  loadProjects();
  loadProjectDetail();

})();
