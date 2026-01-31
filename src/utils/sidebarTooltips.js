// Add tooltips to sidebar tabs
export const initSidebarTooltips = () => {
    const tooltips = {
        'templates': 'Templates',
        'text': 'Text',
        'click': 'CTA',
        'interactive': 'Interactive',
        'upload': 'Upload',
        'elements': 'Elements',
        'background': 'Background'
    };

    // Wait for DOM to be ready
    setTimeout(() => {
        const tabs = document.querySelectorAll('.polotno-side-panel-tab, .bp5-tab');
        tabs.forEach(tab => {
            const text = tab.textContent?.toLowerCase().trim();

            // Match the tab text to our tooltip mapping
            for (const [key, value] of Object.entries(tooltips)) {
                if (text === key || text === value.toLowerCase()) {
                    tab.setAttribute('data-tooltip', value);
                    break;
                }
            }

            // Also check by aria-label or name attribute
            const ariaLabel = tab.getAttribute('aria-label')?.toLowerCase();
            if (ariaLabel) {
                for (const [key, value] of Object.entries(tooltips)) {
                    if (ariaLabel.includes(key)) {
                        tab.setAttribute('data-tooltip', value);
                        break;
                    }
                }
            }
        });
    }, 500);
};
