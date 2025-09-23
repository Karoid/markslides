import { ReactNode } from 'react';
import ImageDialog from '@/components/dialogs/ImageDialog';
import VegaDialog from '@/components/dialogs/VegaDialog';
import { vegaExamples } from '@/toolbar/commands/vega';

export interface DialogConfig {
    component: ReactNode;
    isOpen: boolean;
}

export interface DialogManagerProps {
    activeDialog: string | null;
    onCloseDialog: () => void;
    onImageSelect?: (imageMarkdown: string) => void;
    onVegaSelect?: (spec: any) => void;
    documentId?: string;
}

function DialogManager({
    activeDialog,
    onCloseDialog,
    onImageSelect,
    onVegaSelect,
    documentId,
}: DialogManagerProps) {
    const renderDialog = () => {
        switch (activeDialog) {
            case 'image':
                return (
                    <ImageDialog
                        isOpen={true}
                        onClose={onCloseDialog}
                        onImageSelect={onImageSelect || (() => {})}
                        documentId={documentId}
                    />
                );
            case 'vega':
                return (
                    <VegaDialog
                        isOpen={true}
                        onClose={onCloseDialog}
                        onSelectExample={onVegaSelect || (() => {})}
                    />
                );
            default:
                return null;
        }
    };

    return <>{renderDialog()}</>;
}

export default DialogManager;
