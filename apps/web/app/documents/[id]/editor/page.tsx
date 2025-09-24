import EditorPage from '@/components/pages/EditorPage';

interface EditorPageProps {
  params: {
    id: string;
  };
}

export default function EditorPageRoute({ params }: EditorPageProps) {
  return <EditorPage documentId={params.id} />;
}
