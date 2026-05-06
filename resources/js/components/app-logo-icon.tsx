import type { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/storage/images/laperin.png"
            alt="Laper.In Logo"
            className={props.className || 'size-5'}
        />
    );
}
