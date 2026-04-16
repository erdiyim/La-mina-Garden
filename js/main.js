// ==================== INTRO CURTAIN ====================
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('intro-overlay');
    overlay.classList.add('active');

    // Intro yazisi gozukur, sonra perde acilir
    setTimeout(() => {
        overlay.classList.add('open');
    }, 1800);

    // Animasyon bitince overlay'i kaldir
    setTimeout(() => {
        overlay.classList.remove('active');
        overlay.classList.add('hidden');
    }, 3200);
});

// ==================== NAVBAR SCROLL ====================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==================== MOBILE MENU ====================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Menu linkine tiklaninca menuyu kapat
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ==================== ACTIVE NAV LINK ====================
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Kademeli animasyon gecikmeleri
            const delay = entry.target.closest('.services-grid, .gallery-grid, .about-features')
                ? index * 100
                : 0;

            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
});

// ==================== GALLERY FILTER ====================
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Active class
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// ==================== LOAD ADMIN DATA ====================
async function loadAdminData() {
    // DataStore: Firebase varsa oradan, yoksa localStorage'dan okur
    const [photos, events, reviews] = await Promise.all([
        DataStore.getAll('photos'),
        DataStore.getAll('events'),
        DataStore.getAll('reviews')
    ]);

    // --- Fotoğraflar ---
    if (photos && photos.length > 0) {
        const galleryGrid = document.getElementById('galleryGrid');
        if (galleryGrid) {
            galleryGrid.innerHTML = '';
            photos.forEach(photo => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.setAttribute('data-category', photo.category);
                item.setAttribute('data-animate', '');
                item.innerHTML = `<img src="${photo.image}" alt="${photo.title}" style="width:100%;height:240px;object-fit:cover;border-radius:12px;">`;
                galleryGrid.appendChild(item);
            });
            // Filtreleri yeniden bağla
            initGalleryFilters();
        }
    }

    // --- Etkinlikler ---
    if (events && events.length > 0) {
        const eventsGrid = document.getElementById('eventsGrid');
        const eventsEmpty = document.getElementById('eventsEmpty');
        if (eventsGrid) {
            const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
            eventsGrid.innerHTML = '';
            events.forEach(event => {
                const d = new Date(event.date);
                const card = document.createElement('div');
                card.className = 'event-card';
                card.setAttribute('data-animate', '');
                card.innerHTML = `
                    <div class="event-date">
                        <span class="event-day">${d.getDate()}</span>
                        <span class="event-month">${months[d.getMonth()]}</span>
                    </div>
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <p>${event.desc || ''}</p>
                        <span class="event-tag"><i class="fas fa-map-marker-alt"></i> La'mina Garden, Başıbüyük</span>
                    </div>
                `;
                eventsGrid.appendChild(card);
            });
            if (eventsEmpty) eventsEmpty.style.display = 'none';
        }
    }

    // --- Yorumlar ---
    if (reviews && reviews.length > 0) {
        const reviewsGrid = document.querySelector('.reviews-grid');
        if (reviewsGrid) {
            reviewsGrid.innerHTML = '';
            reviews.forEach(review => {
                const starsHtml = '<i class="fas fa-star"></i>'.repeat(review.stars);
                const card = document.createElement('div');
                card.className = 'review-card';
                card.setAttribute('data-animate', '');
                card.innerHTML = `
                    <div class="review-stars">${starsHtml}</div>
                    <p class="review-text">"${review.text}"</p>
                    <div class="review-author">
                        <div class="review-avatar"><i class="fas fa-user"></i></div>
                        <div>
                            <h4>${review.author}</h4>
                            <span>Google Yorumu</span>
                        </div>
                    </div>
                `;
                reviewsGrid.appendChild(card);
            });
        }
    }

    // Yeni eklenen elementlere animasyon ekle
    document.querySelectorAll('[data-animate]:not(.visible)').forEach(el => {
        observer.observe(el);
    });
}

function initGalleryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        // Eski listener'ları temizlemek için clone
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            const filter = newBtn.getAttribute('data-filter');
            document.querySelectorAll('.gallery-item').forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });
}

// Sayfa yüklendiğinde admin verilerini yükle
document.addEventListener('DOMContentLoaded', loadAdminData);

// ==================== COUNTER ANIMATION ====================
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.counter-number');
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // easeOutExpo
                    const ease = 1 - Math.pow(2, -10 * progress);
                    const current = target * ease;

                    counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = isDecimal ? target.toFixed(1) : target;
                    }
                }
                requestAnimationFrame(updateCounter);
            });
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const counterSection = document.querySelector('.counter-section');
if (counterSection) counterObserver.observe(counterSection);

// ==================== LIGHTBOX ====================
let lightboxImages = [];
let lightboxIndex = 0;

function openLightbox(src, index) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    img.src = src;
    lightboxIndex = index;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
    document.getElementById('lightboxImg').src = lightboxImages[lightboxIndex];
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));

document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
});

// Galeri itemlerine tıklama olayı ekle
function initLightboxClicks() {
    lightboxImages = [];
    document.querySelectorAll('.gallery-item img').forEach((img, i) => {
        lightboxImages.push(img.src);
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => openLightbox(img.src, i));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initLightboxClicks, 500);
});

// ==================== LANGUAGE TOGGLE ====================
let currentLang = 'tr';

document.getElementById('langToggle').addEventListener('click', () => {
    currentLang = currentLang === 'tr' ? 'en' : 'tr';

    // Buton metnini güncelle
    const toggle = document.getElementById('langToggle');
    toggle.querySelector('.lang-flag').textContent = currentLang === 'tr' ? 'EN' : 'TR';
    toggle.title = currentLang === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç';

    // Intro subtitle
    const introSub = document.querySelector('.intro-subtitle');
    if (introSub) introSub.textContent = currentLang === 'tr' ? 'Doğanın Kalbinde' : 'In the Heart of Nature';

    // data-tr / data-en olan tüm elementleri güncelle
    document.querySelectorAll('[data-tr][data-en]').forEach(el => {
        const text = el.getAttribute(currentLang === 'tr' ? 'data-tr' : 'data-en');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.innerHTML = text;
        }
    });

    // HTML lang attribute
    document.documentElement.lang = currentLang === 'tr' ? 'tr' : 'en';
});

// ==================== COOKIE BANNER ====================
(function() {
    const banner = document.getElementById('cookieBanner');
    if (!banner) return;

    // Daha önce kabul/ret edilmiş mi?
    const cookieChoice = localStorage.getItem('laminaCookies');
    if (cookieChoice) {
        banner.classList.add('hidden');
        return;
    }

    document.getElementById('cookieAccept').addEventListener('click', () => {
        localStorage.setItem('laminaCookies', 'accepted');
        banner.classList.add('hidden');
    });

    document.getElementById('cookieDecline').addEventListener('click', () => {
        localStorage.setItem('laminaCookies', 'declined');
        banner.classList.add('hidden');
    });
})();

// ==================== IMAGE LOADING ANIMATION ====================
function initImageLoading() {
    document.querySelectorAll('.gallery-item img, .about-image img').forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
            const wrapper = img.closest('.img-loading-wrapper');
            if (wrapper) wrapper.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
                const wrapper = img.closest('.img-loading-wrapper');
                if (wrapper) wrapper.classList.add('loaded');
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initImageLoading, 600);
});

// ==================== SMOOTH SCROLL (fallback) ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== CAMPAIGN BANNER ====================
(async function() {
    const banner = document.getElementById('campaignBanner');
    const text = document.getElementById('campaignText');
    if (!banner || !text) return;

    try {
        const settings = await DataStore.getSettings();
        if (settings.campaignText && settings.campaignActive) {
            text.textContent = settings.campaignText;
            banner.style.display = 'block';
        }
    } catch(e) {}
})();

// ==================== RESERVATION FORM ====================
(function() {
    const submitBtn = document.getElementById('rezSubmit');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', () => {
        const name = document.getElementById('rezName').value.trim();
        const phone = document.getElementById('rezPhone').value.trim();
        const date = document.getElementById('rezDate').value;
        const guests = document.getElementById('rezGuests').value;
        const service = document.getElementById('rezService').value;
        const notes = document.getElementById('rezNotes').value.trim();

        if (!name) return alert(currentLang === 'en' ? 'Please enter your name.' : 'Lütfen adınızı girin.');
        if (!phone) return alert(currentLang === 'en' ? 'Please enter your phone number.' : 'Lütfen telefon numaranızı girin.');
        if (!date) return alert(currentLang === 'en' ? 'Please select a date.' : 'Lütfen tarih seçin.');

        // Tarihi formatla
        const d = new Date(date);
        const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
        const dateStr = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

        // WhatsApp mesajı oluştur
        let msg = `Merhaba, rezervasyon yapmak istiyorum.\n\n`;
        msg += `👤 Ad: ${name}\n`;
        msg += `📞 Telefon: ${phone}\n`;
        msg += `📅 Tarih: ${dateStr}\n`;
        if (guests) msg += `👥 Kişi Sayısı: ${guests}\n`;
        msg += `🎯 Hizmet: ${service}\n`;
        if (notes) msg += `📝 Not: ${notes}\n`;
        msg += `\n— laminagarden.net üzerinden gönderildi`;

        const url = 'https://wa.me/905459711285?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');
    });
})();

// ==================== DARK MODE ====================
(function() {
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    if (!toggle) return;

    // Kayıtlı tema tercihini kontrol et
    const savedTheme = localStorage.getItem('laminaTheme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.textContent = '☀️';
        label.setAttribute('data-tr', 'Aydınlık Mod');
        label.setAttribute('data-en', 'Light Mode');
        label.textContent = 'Aydınlık Mod';
        toggle.title = 'Aydınlık Mod';
    }

    toggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            icon.textContent = '🌙';
            label.setAttribute('data-tr', 'Karanlık Mod');
            label.setAttribute('data-en', 'Dark Mode');
            label.textContent = currentLang === 'en' ? 'Dark Mode' : 'Karanlık Mod';
            toggle.title = currentLang === 'en' ? 'Dark Mode' : 'Karanlık Mod';
            localStorage.setItem('laminaTheme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            icon.textContent = '☀️';
            label.setAttribute('data-tr', 'Aydınlık Mod');
            label.setAttribute('data-en', 'Light Mode');
            label.textContent = currentLang === 'en' ? 'Light Mode' : 'Aydınlık Mod';
            toggle.title = currentLang === 'en' ? 'Light Mode' : 'Aydınlık Mod';
            localStorage.setItem('laminaTheme', 'dark');
        }
    });
})();

// ==================== AMBIENT SOUND ====================
(function() {
    const toggle = document.getElementById('soundToggle');
    const audio = document.getElementById('ambientAudio');
    if (!toggle || !audio) return;

    let isPlaying = false;

    toggle.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            toggle.classList.remove('playing');
            toggle.title = 'Doğa sesi';
        } else {
            audio.volume = 0.3; // Düşük ses seviyesi
            audio.play().then(() => {
                toggle.classList.add('playing');
                toggle.title = 'Sesi kapat';
            }).catch(() => {
                // Tarayıcı autoplay engelleyebilir, sorun değil
            });
        }
        isPlaying = !isPlaying;
    });

    // Sayfa kapatılınca sesi durdur
    window.addEventListener('beforeunload', () => {
        audio.pause();
    });
})();

// ==================== GALLERY PARALLAX SCROLL ====================
(function() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    if (!galleryItems.length) return;

    let ticking = false;

    function updateParallax() {
        galleryItems.forEach(img => {
            const item = img.closest('.gallery-item');
            if (!item) return;
            const rect = item.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Sadece görünür olanları işle
            if (rect.top < windowHeight && rect.bottom > 0) {
                const scrollPercent = (rect.top - windowHeight) / (rect.height + windowHeight);
                const translateY = scrollPercent * 25;
                img.style.setProperty('--parallax-y', translateY + 'px');
            }
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
})();

// ==================== EVENT COUNTDOWN ====================
(async function() {
    const banner = document.getElementById('countdownBanner');
    if (!banner) return;

    // Önce admin panelden eklenen etkinlikleri kontrol et
    let targetDate = null;
    let eventName = '';

    try {
        const events = await DataStore.getAll('events');
        const now = new Date();

        // Gelecekteki en yakın etkinliği bul
        const futureEvents = events
            .filter(e => new Date(e.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (futureEvents.length > 0) {
            targetDate = new Date(futureEvents[0].date);
            eventName = futureEvents[0].title;
        }
    } catch(e) {}

    // Admin etkinliği yoksa sabit Hıdırellez etkinliğini kullan
    if (!targetDate) {
        const now = new Date();
        let year = now.getFullYear();
        // Hıdırellez her yıl 5 Mayıs
        targetDate = new Date(year, 4, 5, 20, 0, 0); // 5 Mayıs saat 20:00
        if (targetDate < now) {
            targetDate = new Date(year + 1, 4, 5, 20, 0, 0);
        }
        eventName = 'Hıdırellez Gecesi';
    }

    // Etkinlik geçmişse banner'ı gösterme
    if (targetDate <= new Date()) {
        banner.style.display = 'none';
        return;
    }

    // Banner'ı göster
    document.getElementById('countdownEventName').textContent = eventName;
    banner.style.display = 'block';

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            banner.style.display = 'none';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('cdDays').textContent = days.toString().padStart(2, '0');
        document.getElementById('cdHours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('cdMinutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('cdSeconds').textContent = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
})();

// ==================== FAQ ACCORDION ====================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        const isActive = item.classList.contains('active');

        // Diğerlerini kapat
        document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('active'));

        // Tıklananı aç/kapat
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ==================== WEATHER WIDGET ====================
(function() {
    const widget = document.getElementById('weatherWidget');
    if (!widget) return;

    // OpenWeatherMap free API - Maltepe, Istanbul
    const API_KEY = ''; // Ücretsiz API key olmadan çalışan alternatif
    const LAT = 40.9529;
    const LON = 29.1713;

    // wttr.in ücretsiz hava durumu API (API key gerektirmez)
    fetch('https://wttr.in/Maltepe+Istanbul?format=j1')
        .then(res => res.json())
        .then(data => {
            const current = data.current_condition[0];
            const temp = current.temp_C;
            const desc = current.lang_tr && current.lang_tr[0] ? current.lang_tr[0].value : current.weatherDesc[0].value;
            const code = parseInt(current.weatherCode);

            // Hava durumuna göre emoji
            let icon = '☀️';
            if (code >= 200 && code < 300) icon = '⛈️';
            else if (code >= 300 && code < 500) icon = '🌧️';
            else if (code >= 500 && code < 600) icon = '🌧️';
            else if (code >= 600 && code < 700) icon = '❄️';
            else if (code >= 700 && code < 800) icon = '🌫️';
            else if (code === 113) icon = '☀️';
            else if (code === 116) icon = '⛅';
            else if (code === 119 || code === 122) icon = '☁️';
            else if (code >= 176) icon = '🌧️';

            document.getElementById('weatherIcon').textContent = icon;
            document.getElementById('weatherTemp').textContent = temp + '°C';
            document.getElementById('weatherDesc').textContent = desc;
            widget.style.display = 'flex';
        })
        .catch(() => {
            // Hava durumu alınamazsa widget gizli kalır
            widget.style.display = 'none';
        });
})();

// ==================== WHATSAPP POPUP ====================
(function() {
    const toggle = document.getElementById('whatsappToggle');
    const popup = document.getElementById('whatsappPopup');
    const closeBtn = document.getElementById('whatsappClose');
    const sendBtn = document.getElementById('wpSendBtn');
    const msgInput = document.getElementById('wpMessageInput');
    const msgTime = document.getElementById('wpMsgTime');

    if (!toggle || !popup) return;

    // Mesaj zamanını ayarla
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    if (msgTime) msgTime.textContent = hours + ':' + mins;

    // Toggle popup
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        popup.classList.toggle('active');
    });

    // Kapat
    closeBtn.addEventListener('click', () => {
        popup.classList.remove('active');
    });

    // Mesaj gönder (WhatsApp'a yönlendir)
    function sendMessage() {
        const msg = msgInput.value.trim() || 'Merhaba, bilgi almak istiyorum.';
        const url = 'https://wa.me/905459711285?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');
        popup.classList.remove('active');
        msgInput.value = '';
    }

    sendBtn.addEventListener('click', sendMessage);
    msgInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Sayfa dışına tıklayınca kapat
    document.addEventListener('click', (e) => {
        if (!popup.contains(e.target) && !toggle.contains(e.target)) {
            popup.classList.remove('active');
        }
    });
})();

// ==================== SERVICE WORKER (PWA) ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW kayıtlı:', reg.scope))
            .catch(err => console.log('SW hatası:', err));
    });
}
