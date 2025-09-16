/**
 * Dummy Image Generator
 * Based on https://github.com/shaneriley/dummy_image/blob/master/site/javascripts/dummy_image.js
 */

export interface DummyImageOptions {
    width?: number;
    height?: number;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    textVerticalAlign?: 'top' | 'middle' | 'bottom';
    padding?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
}

export interface NodeInfo {
    id: string;
    text: string;
    shape?: string;
    style?: string;
}

/**
 * Generate a dummy image URL with the given options
 */
export function generateDummyImageUrl(options: DummyImageOptions = {}): string {
    const {
        width = 200,
        height = 100,
        text = '',
        backgroundColor = '#f0f0f0',
        textColor = '#333333',
        fontSize = 14,
        fontFamily = 'Arial, sans-serif',
        textAlign = 'center',
        textVerticalAlign = 'middle',
        padding = 10,
        borderRadius = 4,
        borderWidth = 1,
        borderColor = '#cccccc'
    } = options;

    // Encode parameters for URL
    const params = new URLSearchParams({
        width: width.toString(),
        height: height.toString(),
        text: text,
        bg: backgroundColor.replace('#', ''),
        fg: textColor.replace('#', ''),
        fs: fontSize.toString(),
        ff: fontFamily,
        ta: textAlign,
        tva: textVerticalAlign,
        p: padding.toString(),
        br: borderRadius.toString(),
        bw: borderWidth.toString(),
        bc: borderColor.replace('#', '')
    });

    return `https://dummyimage.com/${width}x${height}/${backgroundColor.replace('#', '')}/${textColor.replace('#', '')}?${params.toString()}`;
}

/**
 * Generate dummy image URL for a Mermaid node
 */
export function generateNodeImageUrl(node: NodeInfo, options: Partial<DummyImageOptions> = {}): string {
    const text = node.text || node.id;
    const shape = node.shape || 'rect';
    
    // Calculate dimensions based on text length and shape
    const textLength = text.length;
    const baseWidth = Math.max(120, textLength * 8 + 40);
    const baseHeight = 100;
    
    let width = baseWidth;
    let height = baseHeight;
    
    // Adjust dimensions based on shape
    switch (shape) {
        case 'circle':
        case 'ellipse':
            width = height = Math.max(baseWidth, baseHeight);
            break;
        case 'diamond':
        case 'rhombus':
            width = Math.max(baseWidth, baseHeight);
            height = Math.max(baseWidth, baseHeight);
            break;
        case 'hexagon':
            width = Math.max(baseWidth, baseHeight);
            height = Math.max(baseWidth, baseHeight);
            break;
        case 'parallelogram':
            width = Math.max(baseWidth + 20, baseHeight);
            break;
        case 'trapezoid':
            width = Math.max(baseWidth + 20, baseHeight);
            break;
    }
    
    // Parse style for colors
    let backgroundColor = '#f0f0f0';
    let textColor = '#333333';
    let borderColor = '#cccccc';
    
    if (node.style) {
        const styleMatch = node.style.match(/fill:([^;]+)/);
        if (styleMatch) {
            backgroundColor = styleMatch[1].trim();
        }
        
        const strokeMatch = node.style.match(/stroke:([^;]+)/);
        if (strokeMatch) {
            borderColor = strokeMatch[1].trim();
        }
        
        const colorMatch = node.style.match(/color:([^;]+)/);
        if (colorMatch) {
            textColor = colorMatch[1].trim();
        }
    }
    
    return generateDummyImageUrl({
        width,
        height,
        text,
        backgroundColor,
        textColor,
        borderColor,
        fontSize: Math.max(12, Math.min(16, Math.floor(width / textLength))),
        ...options
    });
}

/**
 * Generate SVG-based dummy image for better text rendering
 */
export function generateNodeSvg(node: NodeInfo, options: Partial<DummyImageOptions> = {}): string {
    const text = node.text || node.id;
    const shape = node.shape || 'rect';
    
    // Calculate dimensions - handle Korean text properly
    const isKorean = /[가-힣]/.test(text);
    const charWidth = isKorean ? 12 : 10; // Korean characters are wider
    const textLength = text.length;
    const baseWidth = Math.max(120, textLength * charWidth + 40);
    const baseHeight = 100;
    
    let width = baseWidth;
    let height = baseHeight;
    
    // Adjust dimensions based on shape
    switch (shape) {
        case 'circle':
        case 'ellipse':
        case 'stadium':
            width = height = Math.max(baseWidth, baseHeight + 20);
            break;
        case 'diamond':
        case 'rhombus':
            width = Math.max(baseWidth + 40, baseHeight + 40);
            height = Math.max(baseWidth + 40, baseHeight + 40);
            break;
        case 'hexagon':
            width = Math.max(baseWidth + 30, baseHeight + 20);
            height = Math.max(baseWidth + 30, baseHeight + 20);
            break;
        case 'parallelogram':
            width = Math.max(baseWidth + 30, baseHeight);
            break;
        case 'trapezoid':
            width = Math.max(baseWidth + 30, baseHeight);
            break;
    }
    
    // Parse style for colors
    let backgroundColor = '#f9f9f9';
    let textColor = '#333333';
    let borderColor = '#666666';
    let borderWidth = 2;
    
    if (node.style) {
        const styleMatch = node.style.match(/fill:([^;]+)/);
        if (styleMatch) {
            backgroundColor = styleMatch[1].trim();
        }
        
        const strokeMatch = node.style.match(/stroke:([^;]+)/);
        if (strokeMatch) {
            borderColor = strokeMatch[1].trim();
        }
        
        const strokeWidthMatch = node.style.match(/stroke-width:([^;]+)/);
        if (strokeWidthMatch) {
            borderWidth = parseInt(strokeWidthMatch[1].trim());
        }
        
        const colorMatch = node.style.match(/color:([^;]+)/);
        if (colorMatch) {
            textColor = colorMatch[1].trim();
        }
    }
    
    // Generate SVG path based on shape
    let path = '';
    const padding = 15;
    const x = padding;
    const y = padding;
    const w = width - padding * 2;
    const h = height - padding * 2;
    
    switch (shape) {
        case 'circle':
            const radius = Math.min(w, h) / 2;
            path = `M ${x + w/2} ${y + h/2} m -${radius} 0 a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0`;
            break;
        case 'stadium':
            const rx = Math.min(w/2, h/2);
            path = `M ${x + rx} ${y} L ${x + w - rx} ${y} A ${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h} L ${x + rx} ${y + h} A ${rx} ${rx} 0 0 1 ${x + rx} ${y} Z`;
            break;
        case 'diamond':
        case 'rhombus':
            path = `M ${x + w/2} ${y} L ${x + w} ${y + h/2} L ${x + w/2} ${y + h} L ${x} ${y + h/2} Z`;
            break;
        case 'hexagon':
            const hexPoints = [
                { x: x + w/4, y: y },
                { x: x + 3*w/4, y: y },
                { x: x + w, y: y + h/2 },
                { x: x + 3*w/4, y: y + h },
                { x: x + w/4, y: y + h },
                { x: x, y: y + h/2 }
            ];
            path = `M ${hexPoints[0].x} ${hexPoints[0].y} ${hexPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} Z`;
            break;
        case 'parallelogram':
            const skew = 15;
            path = `M ${x + skew} ${y} L ${x + w} ${y} L ${x + w - skew} ${y + h} L ${x} ${y + h} Z`;
            break;
        case 'trapezoid':
            const trapSkew = 15;
            path = `M ${x + trapSkew} ${y} L ${x + w - trapSkew} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
            break;
        default: // rect
            path = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
            break;
    }
    
    // Calculate font size based on text length and container size
    const maxFontSize = isKorean ? 16 : 18;
    const minFontSize = 12;
    const calculatedSize = Math.min(maxFontSize, Math.max(minFontSize, Math.floor((w - 20) / textLength * (isKorean ? 1.2 : 1.8))));
    
    // Escape text for SVG
    const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style>
                .node-text {
                    font-family: ${isKorean ? '"Noto Sans KR", "Malgun Gothic", Arial, sans-serif' : 'Arial, sans-serif'};
                    font-size: ${calculatedSize}px;
                    fill: ${textColor};
                    text-anchor: middle;
                    dominant-baseline: central;
                    font-weight: 500;
                }
            </style>
        </defs>
        <path d="${path}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>
        <text x="${width/2}" y="${height/2}" class="node-text">${escapedText}</text>
    </svg>`;
    
    // Use btoa for base64 encoding, but handle Unicode properly
    try {
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch (e) {
        // Fallback: use URL encoding instead of base64
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
}
