'use client';

import {
    useImperativeHandle,
    useRef,
    useCallback,
    memo,
    forwardRef,
} from 'react';
import type { MouseEvent, ForwardedRef } from 'react';
import styled from 'styled-components';
import {
    useDefaultMarpRender,
    type SlideConfigState,
} from '@markslides/renderer';

function findMarpitSvgElement(element: HTMLElement) {
    let currentElement = element;

    while (currentElement !== null) {
        if (
            currentElement.tagName === 'svg' &&
            currentElement.getAttribute('data-marpit-svg') !== null
        ) {
            return currentElement;
        }

        if (!currentElement.parentElement) {
            break;
        }
        currentElement = currentElement.parentElement;
    }

    return null;
}

function getIndexOfChildElement(parentElement: Element, childElement: Element) {
    const children = parentElement.children;
    let index;

    for (index = 0; index < children.length; index++) {
        if (children[index] === childElement) {
            break;
        }
    }
    return index;
}

const Wrapper = styled.div`
    min-height: 100%;
    height: max-content;
    padding: 32px;
    background-color: #eeeeee;
`;

const MarpitContainer = styled.div`
    height: 100%;

    .marpit {
        min-height: 100%;
        display: flex;
        flex-direction: column;
        gap: 32px;
        font-family: 'Noto Sans KR', sans-serif;

        & > * {
            box-shadow: 0 0 4px 8px transparent;
            transition: box-shadow 0.2s ease-in-out;
        }

        & > .current-slide-highlight {
            box-shadow: 0 0 4px 8px #d292ff;
        }
    }
`;

type PreviewFragmentProps = {
    config: SlideConfigState;
    content: string;
    onClickSlide: (slide: HTMLElement, index: number) => void;
};

export type PreviewFragmentRef = {
    setCurrentPage: (pageNumber: number, isScrollIntoView?: boolean) => void;
    highlightSlide: (pageNumber: number) => void;
    clearHighlight: () => void;
};

function PreviewFragment(
    props: PreviewFragmentProps,
    ref: ForwardedRef<PreviewFragmentRef>
) {
    const { config, content, onClickSlide } = props;

    const { html, css, comments, refresh } = useDefaultMarpRender(
        config,
        content
    );

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const highlightSlide = useCallback((pageNumber: number) => {
        if (!wrapperRef.current) return;

        // Clear previous highlight
        const prevHighlighted = wrapperRef.current.querySelector('.current-slide-highlight');
        if (prevHighlighted) {
            prevHighlighted.classList.remove('current-slide-highlight');
        }

        // Add highlight to new slide
        const marpitElem = wrapperRef.current.querySelector('.marpit');
        if (marpitElem) {
            const currentSlideElem = marpitElem.children[pageNumber - 1];
            if (currentSlideElem) {
                currentSlideElem.classList.add('current-slide-highlight');
            }
        }
    }, []);

    const clearHighlight = useCallback(() => {
        if (!wrapperRef.current) return;

        const highlighted = wrapperRef.current.querySelector('.current-slide-highlight');
        if (highlighted) {
            highlighted.classList.remove('current-slide-highlight');
        }
    }, []);

    useImperativeHandle(ref, () => ({
        setCurrentPage: (
            pageNumber: number,
            isScrollIntoView: boolean = true
        ) => {
            if (wrapperRef.current && isScrollIntoView) {
                const marpitElem = wrapperRef.current.querySelector('.marpit');
                if (marpitElem) {
                    const currentSlideElem =
                        marpitElem.children[pageNumber - 1];
                    if (currentSlideElem) {
                        currentSlideElem.scrollIntoView({
                            // NOTE: Chrome 140 ScrollIntoView container option
                            // https://developer.chrome.com/release-notes/140#scrollintoview_container_option
                            // @ts-ignore
                            container: 'nearest',
                            block: 'center',
                            inline: 'center',
                            behavior: 'smooth',
                        });
                    }
                }
            }
        },
        highlightSlide,
        clearHighlight,
    }));

    const handleClickMarpitContainer = useCallback(
        (event: MouseEvent) => {
            const sectionElem = findMarpitSvgElement(
                event.target as HTMLElement
            );
            if (sectionElem && sectionElem.parentElement) {
                const pageIndex = getIndexOfChildElement(
                    sectionElem.parentElement,
                    sectionElem
                );

                onClickSlide(sectionElem, pageIndex);
            }
        },
        [onClickSlide]
    );

    if (!html) {
        return <Wrapper />;
    }

    return (
        <Wrapper ref={wrapperRef}>
            <style>{css}</style>
            <MarpitContainer
                dangerouslySetInnerHTML={{
                    __html: html,
                }}
                onClick={handleClickMarpitContainer}
            />
        </Wrapper>
    );
}

export default memo(forwardRef(PreviewFragment));
