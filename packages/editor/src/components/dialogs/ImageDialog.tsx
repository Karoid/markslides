'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { X, Upload, Image as ImageIcon, Loader2, Trash2, Settings } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import ImageSettingsForm from '../forms/ImageSettingsForm';
import type { ImageSettings } from '@/lib/types/imageSettings';
import { DEFAULT_IMAGE_SETTINGS, generateMarpitImageMarkdown } from '@/lib/types/imageSettings';

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const DialogContainer = styled.div`
    background: white;
    border-radius: 8px;
    width: 90vw;
    max-width: 800px;
    height: 80vh;
    max-height: 600px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: between;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    flex: 1;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        background-color: #f3f4f6;
    }
`;

const TabContainer = styled.div`
    display: flex;
    border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button<{ $active: boolean }>`
    padding: 12px 24px;
    border: none;
    background: none;
    cursor: pointer;
    font-weight: 500;
    color: ${({ $active }) => ($active ? '#3b82f6' : '#6b7280')};
    border-bottom: 2px solid ${({ $active }) => ($active ? '#3b82f6' : 'transparent')};
    
    &:hover {
        color: #3b82f6;
        background-color: #f8fafc;
    }
`;

const Content = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 20px;
`;

const UploadArea = styled.div<{ $isDragOver: boolean }>`
    border: 2px dashed ${({ $isDragOver }) => ($isDragOver ? '#3b82f6' : '#d1d5db')};
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    background-color: ${({ $isDragOver }) => ($isDragOver ? '#f0f9ff' : '#f9fafb')};
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        border-color: #3b82f6;
        background-color: #f0f9ff;
    }
`;

const UploadInput = styled.input`
    display: none;
`;

const ImageGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    margin-top: 20px;
`;

const ImageItem = styled.div`
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    
    &:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
`;

const ImageActions = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    
    ${ImageItem}:hover & {
        opacity: 1;
    }
`;

const ActionButton = styled.button`
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: rgba(0, 0, 0, 0.9);
    }
    
    &.delete:hover {
        background-color: #dc2626;
    }
`;

const ImagePreview = styled.img`
    width: 100%;
    height: 120px;
    object-fit: cover;
`;

const ImageInfo = styled.div`
    padding: 8px;
    font-size: 12px;
    color: #6b7280;
    background-color: #f9fafb;
`;

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #6b7280;
`;

const SpinAnimation = styled.div`
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    color: #6b7280;
`;

export interface ImageItem {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
    createdAt: string;
}

interface ImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImageSelect: (imageMarkdown: string) => void;
    documentId?: string;
}

const ImageDialog: React.FC<ImageDialogProps> = ({
    isOpen,
    onClose,
    onImageSelect,
    documentId,
}) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [imageSettings, setImageSettings] = useState<ImageSettings>(DEFAULT_IMAGE_SETTINGS);
    const [showSettings, setShowSettings] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; imageId: string; imageName: string }>({
        isOpen: false,
        imageId: '',
        imageName: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 이미지 목록 로드
    const loadImages = useCallback(async () => {
        setIsLoadingImages(true);
        try {
            const params = new URLSearchParams();
            if (documentId) {
                params.append('documentId', documentId);
            }
            
            const response = await fetch(`/api/images?${params}`);
            if (response.ok) {
                const data = await response.json();
                setImages(data.images);
            }
        } catch (error) {
            console.error('이미지 목록 로드 실패:', error);
        } finally {
            setIsLoadingImages(false);
        }
    }, [documentId]);

    // 다이얼로그가 열릴 때 이미지 목록 로드
    useEffect(() => {
        if (isOpen && activeTab === 'gallery') {
            loadImages();
        }
    }, [isOpen, activeTab, loadImages]);

    // 파일 업로드 처리
    const handleFileUpload = useCallback(async (files: FileList) => {
        const file = files[0];
        if (!file || !file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('파일 크기는 2MB를 초과할 수 없습니다.');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            if (documentId) {
                formData.append('documentId', documentId);
            }

            const response = await fetch('/api/images/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const uploadedImage = await response.json();
                const imageMarkdown = generateMarpitImageMarkdown(uploadedImage.url, imageSettings);
                onImageSelect(imageMarkdown);
                onClose();
            } else {
                const error = await response.json();
                alert(`업로드 실패: ${error.error}`);
            }
        } catch (error) {
            console.error('업로드 오류:', error);
            alert('업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    }, [documentId, onImageSelect, onClose]);

    // 드래그 앤 드롭 핸들러
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    }, [handleFileUpload]);

    // 파일 선택 핸들러
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    }, [handleFileUpload]);

    // 이미지 선택 핸들러
    const handleImageClick = useCallback((image: ImageItem) => {
        const imageMarkdown = generateMarpitImageMarkdown(image.url, imageSettings);
        onImageSelect(imageMarkdown);
        onClose();
    }, [onImageSelect, onClose, imageSettings]);

    // 이미지 삭제 핸들러
    const handleDeleteClick = useCallback((e: React.MouseEvent, image: ImageItem) => {
        e.stopPropagation();
        setDeleteConfirm({
            isOpen: true,
            imageId: image.id,
            imageName: image.originalName,
        });
    }, []);

    // 삭제 확인 핸들러
    const handleDeleteConfirm = useCallback(async () => {
        try {
            const response = await fetch(`/api/images/upload?id=${deleteConfirm.imageId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // 이미지 목록에서 제거
                setImages(prev => prev.filter(img => img.id !== deleteConfirm.imageId));
                setDeleteConfirm({ isOpen: false, imageId: '', imageName: '' });
            } else {
                const error = await response.json();
                alert(`삭제 실패: ${error.error}`);
            }
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    }, [deleteConfirm]);

    // 삭제 취소 핸들러
    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirm({ isOpen: false, imageId: '', imageName: '' });
    }, []);

    if (!isOpen) return null;

    return (
        <SpinAnimation>
            <Overlay onClick={onClose}>
                <DialogContainer onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>이미지 삽입</Title>
                    <CloseButton onClick={onClose}>
                        <X size={20} />
                    </CloseButton>
                </Header>

                <TabContainer>
                    <Tab 
                        $active={activeTab === 'upload'} 
                        onClick={() => setActiveTab('upload')}
                    >
                        <Upload size={16} style={{ marginRight: 8 }} />
                        업로드
                    </Tab>
                    <Tab 
                        $active={activeTab === 'gallery'} 
                        onClick={() => {
                            setActiveTab('gallery');
                            loadImages();
                        }}
                    >
                        <ImageIcon size={16} style={{ marginRight: 8 }} />
                        갤러리
                    </Tab>
                    <div style={{ marginLeft: 'auto', padding: '12px 16px' }}>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px 8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: showSettings ? '#3b82f6' : '#6b7280',
                            }}
                        >
                            <Settings size={14} style={{ marginRight: 4 }} />
                            설정
                        </button>
                    </div>
                </TabContainer>

                <Content>
                    {showSettings && (
                        <ImageSettingsForm
                            settings={imageSettings}
                            onChange={setImageSettings}
                        />
                    )}
                    
                    {activeTab === 'upload' && (
                        <>
                            <UploadArea
                                $isDragOver={isDragOver}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <div>
                                        <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} />
                                        <p>업로드 중...</p>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload size={32} style={{ margin: '0 auto 16px', color: '#6b7280' }} />
                                        <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 500 }}>
                                            이미지를 드래그하여 놓거나 클릭하여 선택하세요
                                        </p>
                                        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
                                            JPEG, PNG, GIF, WebP (최대 2MB)
                                        </p>
                                    </div>
                                )}
                            </UploadArea>
                            <UploadInput
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </>
                    )}

                    {activeTab === 'gallery' && (
                        <>
                            {isLoadingImages ? (
                                <LoadingContainer>
                                    <Loader2 size={24} className="animate-spin" style={{ marginRight: 8 }} />
                                    이미지 목록을 불러오는 중...
                                </LoadingContainer>
                            ) : images.length === 0 ? (
                                <EmptyState>
                                    <ImageIcon size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
                                    <p>업로드된 이미지가 없습니다.</p>
                                </EmptyState>
                            ) : (
                                <ImageGrid>
                                    {images.map((image) => (
                                        <ImageItem
                                            key={image.id}
                                            onClick={() => handleImageClick(image)}
                                        >
                                            <ImageActions>
                                                <ActionButton
                                                    className="delete"
                                                    onClick={(e) => handleDeleteClick(e, image)}
                                                    title="이미지 삭제"
                                                >
                                                    <Trash2 size={12} />
                                                </ActionButton>
                                            </ImageActions>
                                            <ImagePreview
                                                src={image.url}
                                                alt={image.originalName}
                                                loading="lazy"
                                            />
                                            <ImageInfo>
                                                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                                                    {image.originalName}
                                                </div>
                                                <div>
                                                    {(image.size / 1024).toFixed(1)} KB
                                                </div>
                                            </ImageInfo>
                                        </ImageItem>
                                    ))}
                                </ImageGrid>
                            )}
                        </>
                    )}
                </Content>
                </DialogContainer>
            </Overlay>
            
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="이미지 삭제"
                message={`"${deleteConfirm.imageName}" 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
                confirmText="삭제"
                cancelText="취소"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </SpinAnimation>
    );
};

export default ImageDialog;
