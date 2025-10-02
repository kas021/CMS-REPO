import { Vehicle, CompanyDetails, InvoiceTemplateSettings } from './types';

export const MAIN_SOURCES = ['Amazon', 'CX Haulage', 'DFS', 'Outside', 'Internal'];

export const VEHICLES: Vehicle[] = [
    { id: '1', registration: 'LG71 ZYX', type: 'Luton Van' },
    { id: '2', registration: 'BV22 ABC', type: 'Sprinter' },
    { id: '3', registration: 'FD70 DEF', type: '7.5 Tonne' },
    { id: '4', registration: 'XY23 GHI', type: 'Artic' },
    { id: '5', registration: 'AB21 CDE', type: 'Luton Van' },
    { id: '6', registration: 'CD22 EFG', type: 'Sprinter' },
    { id: '7', registration: 'EF73 GHI', type: '7.5 Tonne' },
    { id: '8', registration: 'GH24 IJK', type: 'Artic' },
];

const initialLogoSvg = `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6a3ab2"></stop><stop offset="100%" style="stop-color:#2a5a9d"></stop></linearGradient></defs><g fill="url(#logoGradient)"><path d="M55.4,29.9c0,16.5-13.4,29.9-29.9,29.9S-4.4,46.4,-4.4,29.9S9,0,25.5,0c8.2,0,15.6,3.3,20.9,8.8l-5.6,5.6 c-3.9-3.9-9.1-6.3-14.8-6.3c-11.6,0-21,9.4-21,21s9.4,21,21,21c11.6,0,21-9.4,21-21H46.5l4.5-4.5l4.5,4.5H55.4z"></path><path d="M42.9,24.2l-14.6-9.1c-0.6-0.4-1.4-0.4-2,0L11.7,24.2c-0.8,0.5-1.3,1.4-1.3,2.4v1.3l12.1-5.4l12.1,5.4v-1.3 C44.2,25.6,43.7,24.7,42.9,24.2z M25.6,29.9l-13.3,6.7v2.1l13.3-4.2l13.3,4.2v-2.1L25.6,29.9z"></path></g><text x="70" y="45" font-family="sans-serif" font-size="36" font-weight="bold" fill="#1f2937">ALS<tspan font-size="24" dy="-0.15em" fill="#4b5563"> Ltd</tspan></text></svg>`;
const initialLogoBase64 = `data:image/svg+xml;base64,${btoa(initialLogoSvg)}`;


export const COMPANY_DETAILS: CompanyDetails = {
    name: 'Airportlink Services Ltd',
    logo: initialLogoBase64,
    address: {
        street: 'Unit 8, Marlin Park\nCentral Way',
        city: 'Feltham',
        postcode: 'TW14 0AN',
        country: 'United Kingdom',
    },
    phone: '020 8890 7392',
    email: 'accounts@als-airportlink.com',
    www: 'airportlinkservices.com',
    regNo: '8609414',
    vatNo: '241105657',
    bankDetails: {
        name: 'HSBC Bank Plc',
        sortCode: '40-25-02',
        account: '12626462',
        bic: 'HBUKGB111F',
        iban: 'GB47HBUK40250212626462',
    },
};

export const DEFAULT_INVOICE_TEMPLATE: InvoiceTemplateSettings = {
    id: 'template-default',
    name: 'Standard Template',
    sections: [
        { id: 'HEADER', name: 'Header', visible: true },
        { id: 'CUSTOMER_DETAILS', name: 'Customer Details', visible: true },
        { id: 'LINE_ITEMS', name: 'Line Items', visible: true },
        { id: 'TOTALS', name: 'Totals', visible: true },
        { id: 'FOOTER', name: 'Footer', visible: true },
    ],
    styles: {
        logoSize: 25, // percentage
        accentColor: '#1a3a6e', // brand-blue
        fontSize: 'text-sm',
        headerAlign: 'left',
    }
};