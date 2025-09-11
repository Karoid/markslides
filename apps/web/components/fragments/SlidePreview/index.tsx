'use client';

import { useMemo } from 'react';
import { useDefaultMarpRender } from '@markslides/renderer';
import { Box } from '@markslides/ui/box';

interface SlidePreviewProps {
    content: string;
    slideConfig?: any;
    height?: string | number;
    width?: string | number;
}

function SlidePreview({ content, slideConfig = {}, height = '200px', width = '100%' }: SlidePreviewProps): JSX.Element {
    // 첫 번째 슬라이드만 추출
    const firstSlideContent = useMemo(() => {
        // 마크다운에서 첫 번째 슬라이드 구분자 찾기
        const slideSeparator = '---';
        const lines = content.split('\n');
        let firstSlideLines: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === slideSeparator && firstSlideLines.length > 0) {
                break;
            }
            firstSlideLines.push(lines[i]);
        }
        
        return firstSlideLines.join('\n');
    }, [content]);

    // Marp 렌더링 훅 사용
    const { html, css } = useDefaultMarpRender(slideConfig, firstSlideContent);

    if (!html) {
        return (
            <Box
                height={height}
                width={width}
                display='flex'
                alignItems='center'
                justifyContent='center'
                backgroundColor='#f8f9fa'
                borderRadius='8px'
                border='1px solid #e2e8f0'>
                <div style={{ color: '#666', fontSize: '14px' }}>Loading...</div>
            </Box>
        );
    }

    return (
        <Box
            height={height}
            width={width}
            overflow='hidden'
            borderRadius='8px'
            border='1px solid #e2e8f0'
            backgroundColor='white'
            position='relative'>
            {/* CSS 스타일 주입 */}
            {css && (
                <style dangerouslySetInnerHTML={{ __html: css }} />
            )}
            
            <Box
                style={{
                    transform: 'scale(0.25)',
                    transformOrigin: 'top left',
                    width: '400%',
                    height: '400%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}>
                <div
                    dangerouslySetInnerHTML={{
                        __html: html || '',
                    }}
                />
            </Box>
        </Box>
    );
}

export default SlidePreview;