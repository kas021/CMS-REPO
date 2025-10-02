import React, { useMemo } from 'react';
import { Job, Invoice, Customer, Driver, InvoiceStatus } from '../types';
import { DocumentChartBarIcon, UserGroupIcon, TruckIcon, CreditCardIcon, CheckCircleIcon } from './icons';

interface SystemStatsPageProps {
    jobs: Job[];
    invoices: Invoice[];
    customers: Customer[];
    drivers: Driver[];
}

const SystemStatsPage: React.FC<SystemStatsPageProps> = ({ jobs, invoices, customers, drivers }) => {

    const stats = useMemo(() => {
        const totalInvoices = invoices.length;
        if (totalInvoices === 0) {
            return {
                numCustomers: customers.length,
                numDrivers: drivers.length,
                numJobs: jobs.length,
                numInvoices: 0,
                // FIX: Use computed property names with InvoiceStatus enum values to ensure consistent object shape.
                invoiceStatusCounts: { 
                    [InvoiceStatus.UNPAID]: 0, 
                    [InvoiceStatus.PARTIALLY_PAID]: 0, 
                    [InvoiceStatus.PAID]: 0,
                    [InvoiceStatus.SETTLED_WITH_CREDIT]: 0,
                },
                numPayments: 0,
                avgInvoiceValue: 0,
                highestInvoiceValue: 0,
                lowestInvoiceValue: 0,
                totalBilled: 0,
                totalCollected: 0,
                totalOutstanding: 0,
            };
        }

        const invoiceStatusCounts = invoices.reduce((acc, inv) => {
            acc[inv.status] = (acc[inv.status] || 0) + 1;
            return acc;
        }, {} as Record<InvoiceStatus, number>);

        const numPayments = invoices.reduce((sum, inv) => sum + inv.paymentHistory.length, 0);
        
        const invoiceValues = invoices.map(inv => inv.totalAmount);
        const totalBilled = invoiceValues.reduce((sum, val) => sum + val, 0);
        const avgInvoiceValue = totalBilled / totalInvoices;
        const highestInvoiceValue = Math.max(...invoiceValues);
        const lowestInvoiceValue = Math.min(...invoiceValues);

        const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
        const totalCollected = totalBilled - totalOutstanding;

        return {
            numCustomers: customers.length,
            numDrivers: drivers.length,
            numJobs: jobs.length,
            numInvoices: totalInvoices,
            invoiceStatusCounts,
            numPayments,
            avgInvoiceValue,
            highestInvoiceValue,
            lowestInvoiceValue,
            totalBilled,
            totalCollected,
            totalOutstanding,
        };
    }, [jobs, invoices, customers, drivers]);

    return (
        <div className="p-6 md:p-8 space-y-8">
            <header className="flex items-center space-x-3">
                <DocumentChartBarIcon className="w-8 h-8 text-brand-blue" />
                <h1 className="text-2xl font-bold text-brand-blue-dark">System Statistics</h1>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Customers" value={stats.numCustomers} icon={UserGroupIcon} isCurrency={false} />
                <StatCard title="Total Drivers" value={stats.numDrivers} icon={TruckIcon} isCurrency={false} />
                <StatCard title="Total Jobs" value={stats.numJobs} icon={TruckIcon} isCurrency={false} />
                <StatCard title="Total Invoices" value={stats.numInvoices} icon={CreditCardIcon} isCurrency={false} />
            </section>
            
            <section className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6">
                 <h2 className="text-xl font-semibold text-brand-blue-dark mb-4">Financial Overview</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Billed" value={stats.totalBilled} />
                    <StatCard title="Total Collected" value={stats.totalCollected} className="text-green-600" />
                    <StatCard title="Total Outstanding" value={stats.totalOutstanding} className="text-red-600" />
                    <StatCard title="Total Payments Logged" value={stats.numPayments} isCurrency={false} />
                 </div>
            </section>
            
            <section className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-6">
                 <h2 className="text-xl font-semibold text-brand-blue-dark mb-4">Invoice Analysis</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* FIX: Use bracket notation with InvoiceStatus enum for type-safe property access. */}
                     <StatCard title="Invoices Paid" value={stats.invoiceStatusCounts[InvoiceStatus.PAID] || 0} icon={CheckCircleIcon} isCurrency={false} className="text-green-600" />
                     <StatCard title="Invoices Unpaid" value={stats.invoiceStatusCounts[InvoiceStatus.UNPAID] || 0} icon={CheckCircleIcon} isCurrency={false} className="text-red-600" />
                     <StatCard title="Partially Paid" value={stats.invoiceStatusCounts[InvoiceStatus.PARTIALLY_PAID] || 0} icon={CheckCircleIcon} isCurrency={false} className="text-blue-600" />
                     <StatCard title="Settled by Credit" value={stats.invoiceStatusCounts[InvoiceStatus.SETTLED_WITH_CREDIT] || 0} icon={CheckCircleIcon} isCurrency={false} className="text-purple-600" />
                    <StatCard title="Average Invoice Value" value={stats.avgInvoiceValue} />
                    <StatCard title="Highest Invoice Value" value={stats.highestInvoiceValue} />
                    <StatCard title="Lowest Invoice Value" value={stats.lowestInvoiceValue} />
                 </div>
            </section>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number;
    isCurrency?: boolean;
    icon?: React.FC<{className?: string}>;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, isCurrency = true, icon: Icon, className="" }) => (
    <div className="bg-white border border-brand-gray-200 rounded-lg p-4 shadow">
        <div className="flex items-center">
            {Icon && <Icon className="w-6 h-6 mr-3 text-brand-gray-400" />}
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        </div>
        <p className={`mt-2 text-3xl font-semibold text-brand-blue-dark ${className}`}>
            {isCurrency ? `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value.toLocaleString('en-GB')}
        </p>
    </div>
);

export default SystemStatsPage;
