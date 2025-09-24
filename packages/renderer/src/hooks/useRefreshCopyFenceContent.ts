import { useCallback, useRef } from 'react';

function useRefreshCopyFenceContent() {
    const cleanupRef = useRef<(() => void) | null>(null);

    return useCallback(() => {
        // Clean up previous event listeners
        if (cleanupRef.current) {
            cleanupRef.current();
        }

        const copyFenceContentButtonElems = Array.from(
            document.querySelectorAll('button.copy-fence-content')
        ) as HTMLButtonElement[];

        const handleClickCopyCodeButton = async (event: Event) => {
            event.stopPropagation();
            event.preventDefault();

            const elem = event.currentTarget as HTMLElement;
            const content = elem.dataset.content;
            if (!content) {
                return;
            }

            try {
                await navigator.clipboard.writeText(content);

                elem.classList.add('active');
                setTimeout(() => {
                    elem.classList.remove('active');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        };

        copyFenceContentButtonElems.forEach((elem) => {
            elem.addEventListener('click', handleClickCopyCodeButton);
        });

        cleanupRef.current = () => {
            copyFenceContentButtonElems.forEach((elem) => {
                elem.removeEventListener('click', handleClickCopyCodeButton);
            });
        };

        return cleanupRef.current;
    }, []);
}

export default useRefreshCopyFenceContent;
