import defaultTheme from '@/themes/default';
// import red from '@/themes/red';
// import green from '@/themes/green';
// import blue from '@/themes/blue';

type MarkSlidesTheme = {
    name: string;
    css: string;
};

const themes: MarkSlidesTheme[] = [
    {
        name: 'default',
        css: defaultTheme,
    },
    // {
    //     name: 'red',
    //     css: red,
    // },
    // {
    //     name: 'green',
    //     css: green,
    // },
    // {
    //     name: 'blue',
    //     css: blue,
    // },
];

export default themes;
