// Marpit 이미지 문법을 기반으로 한 이미지 설정 타입
export interface ImageSettings {
    // 기본 속성
    alt?: string;
    title?: string;
    
    // 크기 조정
    width?: string | number;
    height?: string | number;
    
    // 정렬
    align?: 'left' | 'center' | 'right';
    
    // 배경
    background?: string;
    
    // 필터 효과
    filter?: string;
    
    // CSS 스타일
    style?: string;
    
    // 클래스
    class?: string;
    
    // ID
    id?: string;
    
    // 데이터 속성
    data?: Record<string, string>;
}

export const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
    alt: '',
    title: '',
    width: '200px',
    height: '',
    align: 'center',
    background: '',
    filter: '',
    style: '',
    class: '',
    id: '',
    data: {},
};

// 이미지 설정을 Marpit 문법으로 변환
export function generateMarpitImageMarkdown(
    url: string, 
    settings: ImageSettings = DEFAULT_IMAGE_SETTINGS
): string {
    const { alt, title, width, height, align, background, filter, style, class: className, id, data } = settings;
    
    // Marpit 이미지 문법: ![속성](url)
    const attributes: string[] = [];
    
    // 크기 속성 (Marpit 문법)
    if (width) {
        attributes.push(`w:${width}`);
    }
    if (height) {
        attributes.push(`h:${height}`);
    }
    
    // 정렬 속성 (Marpit 문법)
    if (align) {
        attributes.push(align);
    }
    
    // 배경 속성 (Marpit 문법)
    if (background) {
        attributes.push(`bg:${background}`);
    }
    
    // 필터 속성 (Marpit 문법)
    if (filter) {
        attributes.push(`filter:${filter}`);
    }
    
    // CSS 스타일이 있는 경우 HTML 태그로 변환
    if (style || className || id || (data && Object.keys(data).length > 0)) {
        const htmlAttributes: string[] = [];
        
        if (style) htmlAttributes.push(`style="${style}"`);
        if (className) htmlAttributes.push(`class="${className}"`);
        if (id) htmlAttributes.push(`id="${id}"`);
        
        // 데이터 속성 추가
        if (data && Object.keys(data).length > 0) {
            Object.entries(data).forEach(([key, value]) => {
                htmlAttributes.push(`data-${key}="${value}"`);
            });
        }
        
        // HTML 태그로 변환
        return `<img src="${url}" alt="${alt || ''}" ${htmlAttributes.join(' ')} />`;
    }
    
    // Marpit 문법으로 변환
    let markdown = `![${attributes.join(' ')}](${url}`;
    
    // title 추가
    if (title) {
        markdown += ` "${title}"`;
    }
    
    markdown += ')';
    
    return markdown;
}
