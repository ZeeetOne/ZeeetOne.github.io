/* Page behavior — scroll reveals, header state, ECG draw-in.
   Loaded by index.html (<script src="js/main.js" defer>); replaces the
   old app.js / scroll-animations.js / nav.js. No data files. */

(function () {
    "use strict";

    var header = document.getElementById("site-header");
    var progressFill = document.getElementById("scroll-progress-fill");

    function onScroll() {
        header.classList.toggle("scrolled", window.scrollY > 24);
        if (progressFill) {
            var scrollable =
                document.documentElement.scrollHeight - window.innerHeight;
            var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
            progressFill.style.width = pct + "%";
        }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    // staggered reveal-on-scroll
    var revealables = document.querySelectorAll("[data-reveal]");

    if ("IntersectionObserver" in window) {
        var perSection = new Map(); // stagger siblings that enter together
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var el = entry.target;
                    var section = el.closest("section") || document.body;
                    var now = performance.now();
                    var group = perSection.get(section);
                    if (!group || now - group.time > 400) {
                        group = { time: now, index: 0 };
                    }
                    el.style.setProperty("--d", group.index * 0.12 + "s");
                    group.index++;
                    perSection.set(section, group);
                    el.classList.add("revealed");
                    observer.unobserve(el);
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        );
        revealables.forEach(function (el) {
            observer.observe(el);
        });

        // ECG line draws itself when it enters the viewport
        var ecg = document.getElementById("ecg");
        if (ecg) {
            new IntersectionObserver(
                function (entries, obs) {
                    if (entries[0].isIntersecting) {
                        ecg.classList.add("in");
                        obs.disconnect();
                    }
                },
                { threshold: 0.4 }
            ).observe(ecg);
        }
    } else {
        revealables.forEach(function (el) {
            el.classList.add("revealed");
        });
        var ecgEl = document.getElementById("ecg");
        if (ecgEl) ecgEl.classList.add("in");
    }
})();
