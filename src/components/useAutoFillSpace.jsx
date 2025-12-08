import { useState, useEffect } from 'react';

/**
 * Custom hook to detect awkward empty spaces in UI
 * Returns true if there's significant empty space that should be filled
 * @param {React.RefObject} containerRef - Reference to the container element
 * @returns {boolean} - Whether to show fill component
 */
const useAutoFillSpace = (containerRef) => {
    const [showFill, setShowFill] = useState(false);

    useEffect(() => {
        const checkSpace = () => {
            if (!containerRef.current) {
                setShowFill(false);
                return;
            }

            const container = containerRef.current;
            const rect = container.getBoundingClientRect();

            // Get viewport height
            const viewportHeight = window.innerHeight;

            // Get container's total height including all content
            const contentHeight = container.scrollHeight;

            // Calculate empty space at top
            const topOffset = rect.top;

            // Calculate total available space
            const totalAvailableSpace = viewportHeight - contentHeight;

            // Decision logic: Show fill if:
            // 1. Container starts near top (within 100px)
            // 2. There's significant empty space (>150px) at bottom
            const shouldShowFill = topOffset < 100 && totalAvailableSpace > 150;

            setShowFill(shouldShowFill);
        };

        // Check on mount and after a short delay (for content to load)
        checkSpace();
        const timeout = setTimeout(checkSpace, 500);

        // Re-check on window resize
        window.addEventListener('resize', checkSpace);
        window.addEventListener('scroll', checkSpace);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', checkSpace);
            window.removeEventListener('scroll', checkSpace);
        };
    }, [containerRef]);

    return showFill;
};

export default useAutoFillSpace;
