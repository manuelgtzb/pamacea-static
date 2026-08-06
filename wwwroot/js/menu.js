document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const navigation = document.getElementById('sidebar');
    if (!menuBtn || !navigation) return;

    const closeMenu = () => {
        navigation.classList.remove('active');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
    };

    menuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = navigation.classList.toggle('active');
        menuBtn.classList.toggle('active', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => {
        if (!navigation.contains(event.target) && !menuBtn.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    });
});
