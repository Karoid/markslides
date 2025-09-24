import { useState } from 'react';
import styled from 'styled-components';
import { XIcon } from 'lucide-react';
import { vegaExamples } from '@/toolbar/commands/vega';

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

const Modal = styled.div`
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    
    &:hover {
        background-color: #f0f0f0;
    }
`;

const Title = styled.h2`
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 16px;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(1, 1fr);
    }
`;

const ExampleCard = styled.div`
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: #007acc;
        box-shadow: 0 4px 12px rgba(0, 122, 204, 0.15);
        transform: translateY(-2px);
    }
`;

const ExampleName = styled.h3`
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
`;

const ExampleDescription = styled.p`
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
`;

const PreviewImage = styled.img`
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 12px;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
`;

interface VegaSpec {
    [key: string]: any;
}

interface VegaExample {
    name: string;
    description: string;
    thumbnail: string;
    spec: VegaSpec;
}

interface VegaDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectExample: (spec: VegaSpec) => void;
}

function VegaDialog({ isOpen, onClose, onSelectExample }: VegaDialogProps) {
    const [selectedExample, setSelectedExample] = useState<VegaExample | null>(null);

    if (!isOpen) return null;

    const handleSelectExample = (example: VegaExample) => {
        setSelectedExample(example);
        onSelectExample(example.spec);
        onClose();
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <XIcon size={20} />
                </CloseButton>
                
                <Title>Select Vega Chart Example</Title>
                
                <Grid>
                    {vegaExamples.map((example, index) => (
                        <ExampleCard
                            key={index}
                            onClick={() => handleSelectExample(example)}>
                            <PreviewImage
                                src={example.thumbnail}
                                alt={example.name}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'flex';
                                    target.style.alignItems = 'center';
                                    target.style.justifyContent = 'center';
                                    target.style.color = 'white';
                                    target.style.fontSize = '14px';
                                    target.style.fontWeight = '500';
                                    target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                    target.src = 'data:image/svg+xml;base64,' + btoa(`<svg width="100" height="60" xmlns="http://www.w3.org/2000/svg"><text x="50" y="35" text-anchor="middle" fill="white" font-size="12" font-family="Arial">${example.name}</text></svg>`);
                                }}
                            />
                            <ExampleName>{example.name}</ExampleName>
                            <ExampleDescription>{example.description}</ExampleDescription>
                        </ExampleCard>
                    ))}
                </Grid>
            </Modal>
        </Overlay>
    );
}

export default VegaDialog;
