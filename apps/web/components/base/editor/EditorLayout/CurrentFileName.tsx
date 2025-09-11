import { memo } from 'react';
import { Flex } from '@markslides/ui/flex';
import { Text } from '@markslides/ui/text';
import { Tooltip } from '@markslides/ui/tooltip';
import useAppSelector from '@/redux/hooks/useAppSelector';

interface CurrentFileNameProps {}

function CurrentFileName(props: CurrentFileNameProps) {
    const localTitle = useAppSelector(
        (state) => state.local.title
    );

    if (localTitle) {
        return (
            <Flex
                marginRight='16px'
                alignItems='center'
                cursor='pointer'>
                <Tooltip
                    hasArrow={true}
                    placement='bottom'
                    label='Current document'
                    aria-label='current document tooltip'>
                    <Text
                        fontSize='0.8rem'
                        color='black'>
                        {localTitle}
                    </Text>
                </Tooltip>
            </Flex>
        );
    }

    return null;
}

export default memo(CurrentFileName);
