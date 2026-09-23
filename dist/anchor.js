(function () {
    (function() {
        const thumb = document.getElementById('anchor-thumb');
        const track = document.querySelector('.anchor-progress-track');
        
        let isDragging = false;
    
        const handleDrag = (e) => {
            if (!isDragging) return;
    
            const rect = track.getBoundingClientRect();
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;
            let offset = (clientY - rect.top) / rect.height;
            
            offset = Math.max(0, Math.min(1, offset));
            
            const targetIndex = Math.round(offset * (sections.length - 1));
            
            if (targetIndex !== currentIndex) {
                applySection(targetIndex, false);
            }
        };
    
        const startDrag = (e) => {
            isDragging = true;
            document.body.classList.add('is-dragging');
            handleDrag(e);
        };
    
        const stopDrag = () => {
            if (isDragging) {
                isDragging = false;
                document.body.classList.remove('is-dragging');
            }
        };
    
        track.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', stopDrag);
    
        track.addEventListener('touchstart', startDrag, { passive: false });
        window.addEventListener('touchmove', handleDrag, { passive: false });
        window.addEventListener('touchend', stopDrag);
    })();
    const sections = sectionIds
        .map(function (id) {
            return document.getElementById(id);
        })
        .filter(Boolean);
    const thumb = document.getElementById('anchor-thumb');
    const navLinks = Array.prototype.slice.call(
        document.querySelectorAll('.left-nav:not(.no-anchor) .nav-item')
    );

    if (!sections.length) return;

    document.body.classList.add('anchor-lock-mode');
    window.scrollTo(0, 0);

    let currentIndex = 0;
    let switchLock = false;
    let touchStartY = null;
    const sectionDisplayMap = new Map();

    function anchorShouldIgnoreKeyboard(e) {
        if (document.body.classList.contains('modal-open')) {
            return true;
        }
        if (document.querySelector('.modal-overlay.is-active')) {
            return true;
        }
        const nodes = [];
        if (e && e.target) {
            nodes.push(e.target);
        }
        const active = document.activeElement;
        if (active) {
            nodes.push(active);
        }
        for (let i = 0; i < nodes.length; i++) {
            let el = nodes[i];
            if (!el || el === document.body || el === document.documentElement) {
                continue;
            }
            if (el.nodeType === 3) {
                el = el.parentElement;
            }
            if (!el) {
                continue;
            }
            if (el.isContentEditable) {
                return true;
            }
            const tag = el.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
                return true;
            }
            if (typeof el.closest === 'function') {
                if (el.closest('input, textarea, select, [contenteditable="true"], .modal-overlay, .modal-container, .profile-sheet, form')) {
                    return true;
                }
            }
        }
        return false;
    }

    sections.forEach(function (section) {
        const computedDisplay = window.getComputedStyle(section).display;
        sectionDisplayMap.set(section, computedDisplay === 'none' ? 'block' : computedDisplay);
    });

    function setProgress(index) {
        if (!thumb || sections.length < 2) return;
        const progress = index / (sections.length - 1);
        const trackHeight = thumb.parentElement.clientHeight;
        const thumbHeight = thumb.clientHeight;
        const offset = (trackHeight - thumbHeight) * progress;
        thumb.style.transform = 'translate(-50%, ' + offset + 'px)';
    }

    function applySection(index, syncHash) {
        currentIndex = Math.max(0, Math.min(index, sections.length - 1));
        const tooltip = document.getElementById('anchor-tooltip');
        if (tooltip) {
            const sectionName = sectionIds[currentIndex];
            tooltip.innerText = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        }

        sections.forEach(function (section, sectionIndex) {
            const isActive = sectionIndex === currentIndex;
            if (isActive) {
                section.style.display = sectionDisplayMap.get(section);
                section.setAttribute('aria-hidden', 'false');

                section.classList.add('is-anchor-active');
                section.classList.remove('anchor-anim-in');
                void section.offsetWidth;
                section.classList.add('anchor-anim-in');
            } else {
                section.classList.remove('is-anchor-active');
                section.classList.remove('anchor-anim-in');
                section.style.display = 'none';
                section.setAttribute('aria-hidden', 'true');
            }
        });

        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                const href = link.getAttribute('href') || '';
                if (!href.startsWith('#')) return;
        
                const id = href.slice(1);
                const targetIndex = sectionIds.indexOf(id);
                if (targetIndex === -1) return;
        
                e.preventDefault();
                applySection(targetIndex, true);
            });
        });

        setProgress(currentIndex);
    }

    function goNext() {
        if (currentIndex >= sections.length - 1) return;
        applySection(currentIndex + 1, true);
    }

    function goPrev() {
        if (currentIndex <= 0) return;
        applySection(currentIndex - 1, true);
    }

    function lockSwitch(ms) {
        switchLock = true;
        window.setTimeout(function () {
            switchLock = false;
        }, ms);
    }

    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            const href = link.getAttribute('href') || '';
            if (href.charAt(0) !== '#') return;

            const id = href.slice(1);
            const targetIndex = sectionIds.indexOf(id);
            if (targetIndex === -1) return;

            e.preventDefault();
            applySection(targetIndex, true);
        });
    });

    function canScrollSection(section, deltaY) {
        if (!section || section.scrollHeight <= section.clientHeight + 1) return false;
        if (deltaY > 0) {
            return section.scrollTop + section.clientHeight < section.scrollHeight - 1;
        }
        return section.scrollTop > 0;
    }

    window.addEventListener(
        'wheel',
        function (e) {
            if (document.body.classList.contains('modal-open') || document.querySelector('.modal-overlay.is-active')) {
                return;
            }
            const activeSection = sections[currentIndex];
            if (canScrollSection(activeSection, e.deltaY)) {
                return;
            }

            e.preventDefault();
            if (switchLock) return;
            if (Math.abs(e.deltaY) < 8) return;

            if (e.deltaY > 0) {
                goNext();
            } else {
                goPrev();
            }
            lockSwitch(500);
        },
        { passive: false }
    );

    window.addEventListener('keydown', function (e) {
        if (anchorShouldIgnoreKeyboard(e)) {
            return;
        }
        const key = e.key;
        const code = e.code;
        const isNext = key === 'ArrowDown' || key === 'PageDown' || key === ' ' || code === 'Space';
        const isPrev = key === 'ArrowUp' || key === 'PageUp';
        if (!isNext && !isPrev) {
            return;
        }
        if (switchLock) {
            return;
        }
        e.preventDefault();
        if (isNext) {
            goNext();
            lockSwitch(500);
        } else {
            goPrev();
            lockSwitch(500);
        }
    });

    window.addEventListener(
        'touchstart',
        function (e) {
            if (!e.touches || !e.touches.length) return;
            touchStartY = e.touches[0].clientY;
        },
        { passive: true }
    );

    window.addEventListener(
        'touchmove',
        function (e) {
            if (document.body.classList.contains('modal-open') || document.querySelector('.modal-overlay.is-active')) {
                return;
            }
            e.preventDefault();
        },
        { passive: false }
    );

    window.addEventListener(
        'touchend',
        function (e) {
            if (document.body.classList.contains('modal-open') || document.querySelector('.modal-overlay.is-active')) {
                return;
            }
            if (switchLock || touchStartY === null) return;
            if (!e.changedTouches || !e.changedTouches.length) return;

            const deltaY = touchStartY - e.changedTouches[0].clientY;
            touchStartY = null;

            if (Math.abs(deltaY) < 35) return;
            if (deltaY > 0) {
                goNext();
            } else {
                goPrev();
            }
            lockSwitch(500);
        },
        { passive: true }
    );

    window.addEventListener('hashchange', function () {
        const hashId = window.location.hash.replace('#', '');
        const hashIndex = sectionIds.indexOf(hashId);
        if (hashIndex !== -1) {
            applySection(hashIndex, false);
        }
    });

    const startHash = window.location.hash.replace('#', '');
    const startIndex = sectionIds.indexOf(startHash);
    applySection(startIndex === -1 ? 0 : startIndex, startIndex !== -1);
})();










// anchor bar
window.addEventListener('load', () => {
    document.querySelectorAll('.center-nav').forEach(nav => {
        const indicator = nav.querySelector('.nav-indicator');
        const items = nav.querySelectorAll('.nav-item, .nav-item-active');

        function moveIndicator(element) {
            if (!element) return;
            indicator.style.left = `${element.offsetLeft}px`;
            indicator.style.width = `${element.offsetWidth}px`;
        }

        const activeItem = nav.querySelector('.nav-item-active');
        if (activeItem) {
            moveIndicator(activeItem);
        } else {
            indicator.style.opacity = '0';
        }

        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                indicator.style.opacity = '1';
                moveIndicator(item);
            });
        });

        nav.addEventListener('mouseleave', () => {
            if (activeItem) {
                moveIndicator(activeItem);
            } else {
                indicator.style.opacity = '0';
            }
        });

        window.addEventListener('resize', () => {
            const currentActive = nav.querySelector('.nav-item-active');
            if (currentActive) moveIndicator(currentActive);
        });
    });
});