'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@markslides/ui/box';
import { Button } from '@markslides/ui/button';
import { Text } from '@markslides/ui/text';
import { Plus, FileText, Calendar, Edit, Trash2 } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  slideConfig: any;
  createdAt: string;
  updatedAt: string;
}

function DashboardPage(): JSX.Element {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleCreateDocument = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Presentation',
          content: '# New Presentation\n\nStart writing your slides here...',
          slideConfig: {},
        }),
      });

      if (response.ok) {
        const document = await response.json();
        router.push(`/slides/${document.id}`);
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box height='100vh' padding='24px' backgroundColor='#f8f9fa'>
      <Box maxWidth='1200px' margin='0 auto'>
        {/* Header */}
        <Box display='flex' justifyContent='space-between' alignItems='center' marginBottom='32px'>
          <Box>
            <Text fontSize='32px' fontWeight='bold' marginBottom='8px' color='#333'>
              MarkSlides Dashboard
            </Text>
            <Text fontSize='16px' color='#666'>
              Create and manage your presentations
            </Text>
          </Box>
          <Button
            onClick={handleCreateDocument}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            <Plus size={20} />
            New Presentation
          </Button>
        </Box>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <Box
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            height='400px'
            backgroundColor='white'
            borderRadius='12px'
            border='2px dashed #ddd'
          >
            <FileText size={64} color='#ccc' />
            <Text fontSize='24px' fontWeight='500' marginTop='16px' color='#666'>
              No presentations yet
            </Text>
            <Text fontSize='16px' color='#999' marginTop='8px'>
              Create your first presentation to get started
            </Text>
            <Button
              onClick={handleCreateDocument}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#007bff',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                marginTop: '24px',
              }}
            >
              <Plus size={20} />
              Create First Presentation
            </Button>
          </Box>
        ) : (
          <Box
            display='grid'
            gridTemplateColumns='repeat(auto-fill, minmax(300px, 1fr))'
            gap='24px'
          >
            {documents.map((document) => (
              <Box
                key={document.id}
                backgroundColor='white'
                borderRadius='12px'
                padding='24px'
                boxShadow='0 2px 8px rgba(0, 0, 0, 0.1)'
                border='1px solid #e9ecef'
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/slides/${document.id}`)}
              >
                <Box display='flex' justifyContent='space-between' alignItems='flex-start' marginBottom='16px'>
                  <Box flex='1'>
                    <Text fontSize='18px' fontWeight='600' marginBottom='8px' color='#333'>
                      {document.title}
                    </Text>
                    <Text fontSize='14px' color='#666' lineHeight='1.4'>
                      {document.content.substring(0, 100)}
                      {document.content.length > 100 && '...'}
                    </Text>
                  </Box>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(document.id);
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#dc3545',
                    }}
                  >
                    <Trash2 size={16} />
                  </Box>
                </Box>

                <Box display='flex' justifyContent='space-between' alignItems='center' marginTop='16px'>
                  <Box display='flex' alignItems='center' gap='8px' color='#666'>
                    <Calendar size={14} />
                    <Text fontSize='12px'>
                      {formatDate(document.updatedAt)}
                    </Text>
                  </Box>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/slides/${document.id}`);
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#007bff',
                    }}
                  >
                    <Edit size={16} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DashboardPage;
