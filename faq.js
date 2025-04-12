 // Accordion functionality
 document.querySelectorAll('.faq-question').forEach(item => {
    item.addEventListener('click', () => {
        const parent = item.parentElement;
        parent.classList.toggle('active');
        
        // Close other items
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            if(otherItem !== parent) {
                otherItem.classList.remove('active');
            }
        });
    });
});