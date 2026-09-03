import React from 'react';
import logo from '../assets/images/logo/f1_logo.png';

type LogoProps = {
    className?: string;
};

export const Logo = ({ className = '' }: LogoProps) => {
    return (
        <img src={logo} alt="F1dle logo" className={className} />
    );
}