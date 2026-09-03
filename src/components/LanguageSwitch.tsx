import React from 'react';
import { Language, useLanguage } from '../i18n/LanguageContext';
import { SegmentedControl } from './ui';

const options: { value: Language; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'fr', label: 'FR' },
];

export const LanguageSwitch = () => {
    const { language, setLanguage } = useLanguage();

    return <SegmentedControl options={options} value={language} onChange={setLanguage} />;
};
