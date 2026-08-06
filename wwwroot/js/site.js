document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const videos = document.querySelectorAll('video[autoplay]');

    if (reducedMotion) {
        videos.forEach(video => video.pause());
        return;
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.play().catch(() => {});
                } else {
                    entry.target.pause();
                }
            });
        }, { rootMargin: '160px 0px', threshold: 0.05 });

        videos.forEach(video => observer.observe(video));
    }
});
