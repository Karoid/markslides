import { memo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flex } from '@markslides/ui/flex';
import { Button } from '@markslides/ui/button';
import { Image } from '@markslides/ui/image';
import { Box } from '@markslides/ui/box';
import { Input } from '@markslides/ui/input';
import { Tooltip } from '@markslides/ui/tooltip';
import { PlayIcon, CloudIcon, LockKeyholeIcon, BookOpenTextIcon } from 'lucide-react';
import useAppDispatch from '@/redux/hooks/useAppDispatch';
import useAppSelector from '@/redux/hooks/useAppSelector';
import { setIsSlideShowMode } from '@/redux/slices/appSlice';
import { setName } from '@/redux/slices/localSlice';

function EditorHeader() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const localTitle = useAppSelector((state) => state.local.title);
    const [isSaved, setIsSaved] = useState(true);
    const [titleValue, setNameValue] = useState(localTitle || '');

    // 제목이 변경되면 저장 상태를 false로 설정
    useEffect(() => {
        setNameValue(localTitle || '');
    }, [localTitle]);

    // 제목 변경 시 저장 상태 업데이트
    useEffect(() => {
        const timer = setTimeout(() => {
            if (titleValue !== localTitle) {
                dispatch(setName(titleValue));
                setIsSaved(false);
                // 1초 후 저장된 것으로 표시
                setTimeout(() => setIsSaved(true), 1000);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [titleValue, localTitle, dispatch]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameValue(e.target.value);
        setIsSaved(false);
    };

    const handleLogoClick = () => {
        router.push('/');
    };

    return (
        <Flex
            height='40px'
            paddingLeft='16px'
            paddingRight='16px'
            alignItems='center'
            justifyContent='space-between'
            backgroundColor='white'
            borderBottom='1px solid #e2e8f0'>
            <Flex alignItems='center' gap='16px'>
                <Image
                    src='/logo_with_text.svg'
                    alt='MarkSlides logo'
                    style={{
                        width: 'auto',
                        height: '24px',
                        cursor: 'pointer',
                    }}
                    onClick={handleLogoClick}
                />
                
                <Flex alignItems='center' gap='8px'>
                    <Input
                        value={titleValue}
                        onChange={handleTitleChange}
                        placeholder='제목을 입력하세요'
                        style={{
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            padding: '4px 8px',
                            minWidth: '200px',
                            background: 'transparent',
                        }}
                        _focus={{
                            outline: '1px solid #3182ce',
                            borderRadius: '4px',
                        }}
                    />
                    
                    <Tooltip
                        label={isSaved ? '저장됨' : '저장 중...'}
                        hasArrow={true}
                        placement='bottom'>
                        <Box>
                            <CloudIcon
                                size={16}
                                color={isSaved ? '#48bb78' : '#a0aec0'}
                            />
                        </Box>
                    </Tooltip>
                    
                </Flex>
            </Flex>

            <Flex alignItems='center' gap='8px'>
                <Button
                    style={{
                        color: 'white',
                        backgroundColor: '#AD00FF',
                        fontSize: '14px',
                        padding: '8px 12px',
                    }}
                    _hover={{
                        backgroundColor: '#8600C6',
                    }}
                    icon={
                        <PlayIcon
                            fill='white'
                            size={14}
                        />
                    }
                    onClick={() => {
                        dispatch(setIsSlideShowMode(true));
                    }}>
                    Slide Show
                </Button>
                
                <Flex gap='4px'>
                    <Button
                        icon={<LockKeyholeIcon size={14} />}
                        style={{
                            fontSize: '12px',
                            padding: '6px 10px',
                        }}>
                        Share
                    </Button>
                    
                    <Button
                        icon={<BookOpenTextIcon size={14} />}
                        style={{
                            fontSize: '12px',
                            padding: '6px 10px',
                        }}>
                        Publish
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
}

export default memo(EditorHeader);
