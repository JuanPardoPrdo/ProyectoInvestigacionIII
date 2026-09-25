/**
 * Utility functions for formatting values across the El Molino UI.
 */

export const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '$ 0';
    const num = typeof value === 'string' ? Number(value) : value;
    if (isNaN(num)) return '$ 0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(num);
};

export const formatNumber = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '0';
    const num = typeof value === 'string' ? Number(value) : value;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('es-CO').format(num);
};
