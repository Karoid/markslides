'use client';

import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, X } from 'lucide-react';

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
    z-index: 1001;
`;

const DialogContainer = styled.div`
    background: white;
    border-radius: 8px;
    width: 90vw;
    max-width: 400px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    padding: 20px 20px 0;
`;

const IconContainer = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #fef3c7;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
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

const Content = styled.div`
    padding: 20px;
`;

const Message = styled.p`
    margin: 0 0 20px;
    color: #6b7280;
    line-height: 1.5;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    ${({ $variant }) => 
        $variant === 'primary' 
            ? `
                background-color: #dc2626;
                color: white;
                border: 1px solid #dc2626;
                
                &:hover {
                    background-color: #b91c1c;
                    border-color: #b91c1c;
                }
            `
            : `
                background-color: white;
                color: #374151;
                border: 1px solid #d1d5db;
                
                &:hover {
                    background-color: #f9fafb;
                }
            `
    }
`;

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = '삭제',
    cancelText = '취소',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <Overlay onClick={onCancel}>
            <DialogContainer onClick={(e) => e.stopPropagation()}>
                <Header>
                    <IconContainer>
                        <AlertTriangle size={20} color="#f59e0b" />
                    </IconContainer>
                    <Title>{title}</Title>
                    <CloseButton onClick={onCancel}>
                        <X size={16} />
                    </CloseButton>
                </Header>
                
                <Content>
                    <Message>{message}</Message>
                    <ButtonContainer>
                        <Button $variant="secondary" onClick={onCancel}>
                            {cancelText}
                        </Button>
                        <Button $variant="primary" onClick={onConfirm}>
                            {confirmText}
                        </Button>
                    </ButtonContainer>
                </Content>
            </DialogContainer>
        </Overlay>
    );
};

export default ConfirmDialog;
