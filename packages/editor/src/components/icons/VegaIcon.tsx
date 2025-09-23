import { IconProps } from '@/components/icons';

function VegaIcon(props: IconProps) {
    const { size = 24, color = 'black' } = props;

    return (
        <svg
            width={size}
            height={size}
            viewBox='0 0 24 24'>
            <path
                fill={color}
                d='M19.39 8.693H24l-3.123 -6.68ZM6.68 1.987H0L7.098 22.03h0.008l2.86 -10.73zm14.197 -0.016 -7.098 20.042h-6.68L14.195 1.97'
            />
        </svg>
    );
}

export default VegaIcon;
