// FIX: Import React to bring React.FC into scope.
import React from 'react';

export enum JobStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    EN_ROUTE = 'EN_ROUTE',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum ShipStatus {
    NORMAL = 'Normal',
    PRIORITY = 'Priority',
}

export enum CalculationMethod {
    PIECES = 'Pieces',
    WEIGHT = 'Weight',
    DIMENSION = 'Dimension',
    DISTANCE = 'Distance',
    OTHER = 'Other',
}

export enum InvoiceStatus {
    UNPAID = 'Unpaid',
    PARTIALLY_PAID = 'Partially Paid',
    PAID = 'Paid',
    SETTLED_WITH_CREDIT = 'Settled with Credit',
}

export interface Job {
    id: number;
    mainSource: string;
    customerId: number; // Added for linking
    company: string;
    department: string;
    awbRef: string;
    shipStatus: ShipStatus;
    pickupAddress: string;
    deliveryAddress: string;
    orderDateTime: string;
    dueDateTime: string;
    description: string;
    note: string;
    pcs: number;
    weight: number;
    dimensionH: number;
    dimensionL: number;
    dimensionW: number;
    distance: number;
    vehicle: string;
    calculationMethod: CalculationMethod;
    finalRate: number;
    referredBy: string;
    referredByEmail: string;
    status: JobStatus;
    emailFrom: string;
    driverId?: number;
    invoiceId?: number;
}

export interface Invoice {
    id: number;
    invoice_ref: string;
    jobId: number;
    customerId: number;
    customerDetails: {
        name: string;
        address: string;
        accountRef: string;
        paymentTerms: string;
    };
    jobDetails: {
        awbRef: string;
        description: string;
        pcs: number;
        weight: number;
        pickupAddress: string;
        deliveryAddress: string;
        jobRef: string; 
    };
    invoiceDate: string;
    dueDate: string;
    subtotal: number;
    vatAmount: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    credit_applied: number;
    status: InvoiceStatus;
    paymentHistory: {
        date: string;
        amount: number;
        method?: 'Cash' | 'Credit Note';
        creditNoteId?: number;
    }[];
}


export type JobFormData = Omit<Job, 'id' | 'status' | 'emailFrom' | 'driverId' | 'invoiceId'> & { id?: number };

export interface Customer {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    accountRef: string;
    paymentTerms: string; // e.g., "After 45 Days"
}


export interface Driver {
    id: number;
    name: string;
    username: string;
    password?: string;
    vehicleType: string;
    vehicleRegistration: string;
}

export interface Vehicle {
    id: string;
    registration: string;
    type: string;
}

export type TabStatus = JobStatus | 'ALL';

export type TabType = 'start' | 'data-entry' | 'data-management' | 'accounts' | 'reports' | 'company-data' | 'version-history' | 'system-stats' | 'accounts-hub' | 'sao' | 'credit-notes' | 'profile' | 'access-denied';

export interface Tab {
    id: string;
    type: TabType;
    title: string;
    icon: React.FC<{className?: string}>;
}

export interface CompanyDetails {
    name: string;
    logo: string; // base64 data URI
    address: {
        street: string;
        city: string;
        postcode: string;
        country: string;
    };
    phone: string;
    email: string;
    www: string;
    regNo: string;
    vatNo: string;
    bankDetails: {
        name: string;
        sortCode: string;
        account: string;
        bic: string;
        iban: string;
    };
}

export type InvoiceSectionType = 'HEADER' | 'CUSTOMER_DETAILS' | 'LINE_ITEMS' | 'TOTALS' | 'FOOTER';

export interface InvoiceTemplateSettings {
    id: string;
    name: string;
    sections: {
        id: InvoiceSectionType;
        name: string;
        visible: boolean;
    }[];
    styles: {
        logoSize: number; // as a percentage of the header width
        accentColor: string;
        fontSize: 'text-xs' | 'text-sm' | 'text-base';
        headerAlign: 'left' | 'center' | 'right';
    };
}

export type InvoiceSearchMode = 'invoice_ref' | 'awb' | 'customer';

// Credit Notes
export enum CreditNoteType {
    JOB_BASED = 'Job-based',
    ACCOUNT_BASED = 'Account-based',
}

export enum CreditNoteStatus {
    ACTIVE = 'Active',
    DEPLETED = 'Depleted',
    VOIDED = 'Voided',
}

export interface CreditNoteApplication {
    date: string;
    appliedAmount: number;
    invoiceId: number;
}

export interface CreditNoteHistory {
    date: string;
    action: 'CREATED' | 'APPLIED' | 'REVERSED' | 'VOIDED' | 'EDITED_REASON' | 'EDITED_BALANCE' | 'MANUAL_APPLICATION';
    details: string;
}

export interface CreditNote {
    id: number;
    creditNoteRef: string;
    customerId: number;
    type: CreditNoteType;
    invoiceId?: number; // For job-based credit notes
    initialAmount: number;
    remainingAmount: number;
    reason: string;
    createdAt: string;
    status: CreditNoteStatus;
    applications: CreditNoteApplication[];
    history: CreditNoteHistory[];
}

export type CreditNoteFormData = Omit<CreditNote, 'id' | 'creditNoteRef' | 'createdAt' | 'applications' | 'remainingAmount' | 'status' | 'history'>;

// User Authentication
export type Role = 'super_admin' | 'admin';
export type AppRole = Role | 'driver';

export interface User {
    id: number;
    username: string;
    role: Role;
    password?: string;
}

export type UserUpdateData = {
    id: number;
    username?: string;
    password?: string;
};

// Driver-specific types
export interface DriverJobSummary {
    id: number;
    awbRef: string;
    pickupCity: string;
    deliveryCity: string;
    status: JobStatus;
}

export interface DriverJobDetail extends DriverJobSummary {
    pickupAddress: string;
    deliveryAddress: string;
    description: string;
    note: string;
    pcs: number;
    weight: number;
}