import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Theme } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { originFromElement } from '../theme/viewTransition';
import { SegmentedControl } from './ui';

/**
 * Parameters
 *   None; reads the current theme from context.
 * What it does
 *   Offers the three theme states as an explicit choice, using the same
 *   SegmentedControl as LanguageSwitch so both header controls read alike. The
 *   clicked segment anchors the circular reveal, so the new theme spreads from
 *   where the user pressed.
 * Output
 *   The theme segmented control.
 */
export const ThemeSwitch = () => {
    const { t } = useLanguage();
    const { theme, setTheme } = useTheme();

    const options: { value: Theme; label: string }[] = [
        { value: 'light', label: t.theme.light },
        { value: 'dark', label: t.theme.dark },
        { value: 'system', label: t.theme.system }
    ];

    return (
        <SegmentedControl
            options={options}
            value={theme}
            onChange={(next, element) => setTheme(next, originFromElement(element))}
        />
    );
};
