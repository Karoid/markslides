import { Marp } from '@marp-team/marp-core';
import { Element as MarpitElement } from '@marp-team/marpit';
import markdownItContainer from 'markdown-it-container';
import markdownItLink from '@markslides/markdown-it-link';
import markdownItMermaid from '@kazumatu981/markdown-it-kroki';
import markdownItTypograms from '@markslides/markdown-it-typograms';
import themes from '@markslides/themes';
import markdownItTaskLists from '@/lib/marp/plugins/taskLists';
import markdownItCopyFenceContent from '@/lib/marp/plugins/copyFenceContent';
import markdownItFenceCodeBlockEnhancer from '@/lib/marp/plugins/fenceCodeBlockEnhancer';
// base64url polyfill for kroki plugin
import '@/lib/polyfills/base64url';

const appMarp = (function () {
    let instance: Marp;

    function createInstance(containerClassName?: string) {
        // https://marpit-api.marp.app/marpit
        const marp = new Marp({
            container: [
                new MarpitElement('div', {
                    class: containerClassName ?? 'marpit',
                }),
            ],
            // slideContainer: new MarpitElement('div', {
            //     class: 'slide',
            // }),
            inlineSVG: true,
            html: true,
            markdown: {
                html: true,
                breaks: true,
            },
        });

        // Set plugins
        marp.use(markdownItContainer, 'columns-2', {});
        marp.use(markdownItContainer, 'columns-3', {});
        marp.use(markdownItContainer, 'columns-4', {});
        marp.use(markdownItContainer, 'columns-5', {});
        marp.use(markdownItContainer, 'columns-6', {});
        marp.use(markdownItLink);
        marp.use(markdownItTaskLists);
        
        // fence 규칙을 수정하는 플러그인들 - 순서가 중요함
        // 1. Mermaid (kroki) - 특정 언어 처리
        marp.use(markdownItMermaid, {
            server: 'https://kroki.io',
            output: 'svg'
        });
        // 2. Typograms - 특정 언어 처리  
        marp.use(markdownItTypograms);
        // 3. Code block enhancer - 일반적인 코드 블록 처리
        marp.use(markdownItFenceCodeBlockEnhancer);
        // 4. Copy fence content - UI 요소 추가 (마지막에)
        marp.use(markdownItCopyFenceContent);

        // Set themes
        if (themes.length > 0) {
            marp.themeSet.default = marp.themeSet.add(themes[0]!.css);
            themes.forEach((theme: { name: string; css: string }) => {
                marp.themeSet.add(theme.css);
            });
        }

        return marp;
    }

    return {
        createInstance,
        getDefaultInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        },
    };
})();

export default appMarp;
