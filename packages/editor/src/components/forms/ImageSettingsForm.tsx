'use client';

import React from 'react';
import styled from 'styled-components';
import { Settings, Image as ImageIcon } from 'lucide-react';
import type { ImageSettings } from '@/lib/types/imageSettings';

const FormContainer = styled.div`
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
`;

const FormHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
`;

const FormTitle = styled.h4`
    margin: 0 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 4px;
`;

const Input = styled.input`
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    
    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
    }
`;

const Select = styled.select`
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    background-color: white;
    
    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
    }
`;

const TextArea = styled.textarea`
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    resize: vertical;
    min-height: 60px;
    
    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
    }
`;

const FullWidthGroup = styled(FormGroup)`
    grid-column: 1 / -1;
`;

const HelpText = styled.p`
    margin: 8px 0 0;
    font-size: 11px;
    color: #9ca3af;
    line-height: 1.4;
`;

interface ImageSettingsFormProps {
    settings: ImageSettings;
    onChange: (settings: ImageSettings) => void;
}

const ImageSettingsForm: React.FC<ImageSettingsFormProps> = ({
    settings,
    onChange,
}) => {
    const handleChange = (field: keyof ImageSettings, value: string) => {
        onChange({
            ...settings,
            [field]: value,
        });
    };

    const handleDataChange = (key: string, value: string) => {
        onChange({
            ...settings,
            data: {
                ...settings.data,
                [key]: value,
            },
        });
    };

    return (
        <FormContainer>
            <FormHeader>
                <Settings size={16} color="#6b7280" />
                <FormTitle>이미지 설정</FormTitle>
            </FormHeader>
            
            <HelpText style={{ marginBottom: 16, padding: 8, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px' }}>
                <strong>Marpit 문법:</strong> ![w:200px h:150px center bg:#ffffff](url)<br/>
                기본 속성만 사용하면 Marpit 문법으로, 고급 CSS가 필요하면 HTML 태그로 생성됩니다.
            </HelpText>
            
            <FormGrid>
                <FormGroup>
                    <Label>Alt 텍스트</Label>
                    <Input
                        type="text"
                        value={settings.alt || ''}
                        onChange={(e) => handleChange('alt', e.target.value)}
                        placeholder="이미지 설명"
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label>제목</Label>
                    <Input
                        type="text"
                        value={settings.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="이미지 제목"
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label>너비</Label>
                    <Input
                        type="text"
                        value={settings.width || ''}
                        onChange={(e) => handleChange('width', e.target.value)}
                        placeholder="예: 200px, 50%"
                    />
                    <HelpText>Marpit 문법: w:200px</HelpText>
                </FormGroup>
                
                <FormGroup>
                    <Label>높이</Label>
                    <Input
                        type="text"
                        value={settings.height || ''}
                        onChange={(e) => handleChange('height', e.target.value)}
                        placeholder="예: 150px, auto"
                    />
                    <HelpText>Marpit 문법: h:150px</HelpText>
                </FormGroup>
                
                <FormGroup>
                    <Label>정렬</Label>
                    <Select
                        value={settings.align || 'center'}
                        onChange={(e) => handleChange('align', e.target.value as 'left' | 'center' | 'right')}
                    >
                        <option value="left">왼쪽</option>
                        <option value="center">가운데</option>
                        <option value="right">오른쪽</option>
                    </Select>
                </FormGroup>
                
                <FormGroup>
                    <Label>배경색</Label>
                    <Input
                        type="text"
                        value={settings.background || ''}
                        onChange={(e) => handleChange('background', e.target.value)}
                        placeholder="예: #ffffff, transparent"
                    />
                    <HelpText>Marpit 문법: bg:#ffffff</HelpText>
                </FormGroup>
                
                <FormGroup>
                    <Label>필터</Label>
                    <Input
                        type="text"
                        value={settings.filter || ''}
                        onChange={(e) => handleChange('filter', e.target.value)}
                        placeholder="예: blur(5px), brightness(1.2)"
                    />
                    <HelpText>Marpit 문법: filter:blur(5px)</HelpText>
                </FormGroup>
                
                <FormGroup>
                    <Label>CSS 클래스</Label>
                    <Input
                        type="text"
                        value={settings.class || ''}
                        onChange={(e) => handleChange('class', e.target.value)}
                        placeholder="예: my-image-class"
                    />
                </FormGroup>
                
                <FormGroup>
                    <Label>ID</Label>
                    <Input
                        type="text"
                        value={settings.id || ''}
                        onChange={(e) => handleChange('id', e.target.value)}
                        placeholder="예: my-image-id"
                    />
                </FormGroup>
                
                <FullWidthGroup>
                    <Label>CSS 스타일</Label>
                    <TextArea
                        value={settings.style || ''}
                        onChange={(e) => handleChange('style', e.target.value)}
                        placeholder="예: border: 1px solid #ccc; margin: 10px;"
                    />
                </FullWidthGroup>
                
                <FullWidthGroup>
                    <Label>데이터 속성 (선택사항)</Label>
                    <Input
                        type="text"
                        value={Object.entries(settings.data || {}).map(([k, v]) => `${k}=${v}`).join(', ')}
                        onChange={(e) => {
                            const pairs = e.target.value.split(',').map(pair => pair.trim());
                            const data: Record<string, string> = {};
                            pairs.forEach(pair => {
                                const [key, value] = pair.split('=');
                                if (key && value) {
                                    data[key.trim()] = value.trim();
                                }
                            });
                            onChange({ ...settings, data });
                        }}
                        placeholder="예: lazy=true, loading=eager"
                    />
                    <HelpText>
                        데이터 속성을 쉼표로 구분하여 입력하세요. (예: lazy=true, loading=eager)
                    </HelpText>
                </FullWidthGroup>
            </FormGrid>
        </FormContainer>
    );
};

export default ImageSettingsForm;
