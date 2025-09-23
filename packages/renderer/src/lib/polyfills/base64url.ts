// base64url polyfill for Node.js Buffer
// This fixes the "Unknown encoding: base64url" error in markdown-it-kroki

declare global {
    namespace NodeJS {
        interface Buffer {
            toString(encoding: 'base64url'): string;
        }
    }
}

// base64url 인코딩을 base64로 변환하는 함수
function base64ToBase64Url(base64: string): string {
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// base64url을 base64로 변환하는 함수
function base64UrlToBase64(base64url: string): string {
    let base64 = base64url
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    // 패딩 추가
    while (base64.length % 4) {
        base64 += '=';
    }
    
    return base64;
}

// Buffer.toString 메서드에 base64url 지원 추가
if (typeof Buffer !== 'undefined') {
    const originalToString = Buffer.prototype.toString;
    
    Buffer.prototype.toString = function(encoding?: BufferEncoding | 'base64url', start?: number, end?: number): string {
        if (encoding === 'base64url') {
            const base64 = originalToString.call(this, 'base64', start, end);
            return base64ToBase64Url(base64);
        }
        return originalToString.call(this, encoding as BufferEncoding, start, end);
    };
}

// Buffer.from 메서드에 base64url 지원 추가
if (typeof Buffer !== 'undefined') {
    const originalFrom = Buffer.from;
    
    // @ts-ignore
    Buffer.from = function(data: any, encoding?: BufferEncoding | 'base64url'): Buffer {
        if (encoding === 'base64url' && typeof data === 'string') {
            const base64 = base64UrlToBase64(data);
            return originalFrom.call(Buffer, base64, 'base64');
        }
        return originalFrom.call(Buffer, data, encoding as BufferEncoding);
    };
}

export { base64ToBase64Url, base64UrlToBase64 };
