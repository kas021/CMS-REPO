import { Job, JobStatus, ShipStatus, CalculationMethod, Customer, Driver, Invoice, InvoiceStatus, CreditNote, CreditNoteType, User, CreditNoteStatus } from './types';
import { MAIN_SOURCES, VEHICLES } from './constants';
import { safeParseDate, parsePaymentTermDays } from './utils/date';

const CITIES = ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Leeds', 'Sheffield', 'Edinburgh', 'Cardiff'];
const STREETS = ['High St', 'Station Rd', 'Main St', 'Park Rd', 'Church Rd', 'Victoria Rd', 'Green Ln', 'The Avenue', 'King St', 'Queen St'];
const POSTCODE_PREFIXES = ['EC1A', 'M1', 'B1', 'G1', 'L1', 'BS1', 'LS1', 'S1', 'EH1', 'CF10'];
const DEPARTMENTS = ['Warehouse', 'Distribution', 'Logistics', 'Receiving', 'Dispatch'];
const DESCRIPTIONS = [
    'pallets of consumer electronics', 'boxes of medical supplies', 'crates of machine parts',
    'rolls of fabric', 'shipment of furniture', 'packages of printed materials', 'containers of raw goods'
];

// Helper functions for random data
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const generateAddress = (): string => `${getRandomInt(1, 200)} ${getRandom(STREETS)}, ${getRandom(CITIES)}, ${getRandom(POSTCODE_PREFIXES)} ${getRandomInt(1, 9)}${String.fromCharCode(65 + getRandomInt(0, 25))}${String.fromCharCode(65 + getRandomInt(0, 25))}`;
const generatePhoneNumber = (): string => `07${getRandomInt(100, 999)} ${getRandomInt(100, 999)} ${getRandomInt(100, 999)}`;

// --- DATA GENERATION ---

// 1. Generate Customers with realistic details
const generateCustomers = (): Customer[] => {
    const customerNames = [
        "SPEED'S JUICE UK LTD", "Global Imports Inc.", "Tech Components Direct", "Fresh Produce Co.",
        "UK Medical Supplies", "BuildRight Hardware", "Fashion Forward Apparel", "Gourmet Foods Distribution",
        "PrintPerfect Solutions", "Office Essentials Ltd."
    ];
    const paymentTerms = ["After 30 Days", "After 45 Days", "After 60 Days", "On Receipt"];
    const customers: Customer[] = [];
    for (let i = 0; i < customerNames.length; i++) {
        const name = customerNames[i];
        const namePrefix = name.substring(0, 3).toUpperCase();
        customers.push({
            id: 1000 + i,
            name: name,
            address: `${getRandomInt(10, 500)} Trade Park, Industrial Estate, ${getRandom(CITIES)}, ${getRandom(POSTCODE_PREFIXES)} ${getRandomInt(1,9)}AX`,
            phone: generatePhoneNumber(),
            email: `accounts@${name.toLowerCase().split(' ')[0].replace(/'/g, '')}.co.uk`,
            accountRef: `${namePrefix}${getRandomInt(100, 999)}`,
            paymentTerms: getRandom(paymentTerms),
        });
    }
    return customers;
};

// 2. Generate Drivers
const generateDrivers = (count: number): Driver[] => {
    const drivers: Driver[] = [];
    const names = ['John Smith', 'Jane Doe', 'Peter Jones', 'Mary Williams', 'David Brown', 'Susan Taylor', 'Michael Davis', 'Linda Wilson', 'James Miller', 'Patricia Moore'];
    for (let i = 0; i < count; i++) {
        const vehicle = getRandom(VEHICLES);
        const name = names[i % names.length];
        drivers.push({
            id: 10 + i,
            name: name,
            username: name.toLowerCase().replace(' ', ''),
            password: 'password123',
            vehicleType: vehicle.type,
            vehicleRegistration: vehicle.registration
        });
    }
    return drivers;
};

// 3. Generate Jobs
const generateJobs = (count: number, customers: Customer[], drivers: Driver[]): Job[] => {
    const jobs: Job[] = [];
    const startDate = new Date('2023-01-01');
    const endDate = new Date();

    for (let i = 1; i <= count; i++) {
        const orderDateTime = getRandomDate(startDate, endDate);
        const dueDateTime = new Date(orderDateTime.getTime() + getRandomInt(1, 5) * 24 * 60 * 60 * 1000);
        const customer = getRandom(customers);
        
        const statusRoll = Math.random();
        let status: JobStatus;
        if (statusRoll < 0.6) status = JobStatus.COMPLETED;
        else if (statusRoll < 0.8) status = JobStatus.PENDING;
        else if (statusRoll < 0.9) status = JobStatus.ASSIGNED;
        else status = JobStatus.CANCELLED;

        const driver = status === JobStatus.ASSIGNED || status === JobStatus.COMPLETED ? getRandom(drivers) : undefined;
        const finalRate = getRandomInt(100, 800);

        const job: Job = {
            id: 1000 + i,
            mainSource: getRandom(MAIN_SOURCES),
            customerId: customer.id,
            company: customer.name,
            department: getRandom(DEPARTMENTS),
            awbRef: `AWB-${getRandomInt(10000, 99999)}-${i}`,
            shipStatus: Math.random() > 0.8 ? ShipStatus.PRIORITY : ShipStatus.NORMAL,
            pickupAddress: generateAddress(),
            deliveryAddress: generateAddress(),
            orderDateTime: orderDateTime.toISOString(),
            dueDateTime: dueDateTime.toISOString(),
            description: `${getRandomInt(1, 20)} ${getRandom(DESCRIPTIONS)}`,
            note: 'Standard delivery protocols apply.',
            pcs: getRandomInt(1, 50),
            weight: getRandomInt(10, 3000),
            dimensionH: parseFloat((Math.random() * 2).toFixed(2)),
            dimensionL: parseFloat((Math.random() * 2).toFixed(2)),
            dimensionW: parseFloat((Math.random() * 2).toFixed(2)),
            distance: getRandomInt(20, 500),
            vehicle: driver?.vehicleRegistration || getRandom(VEHICLES).registration,
            calculationMethod: getRandom(Object.values(CalculationMethod)),
            finalRate,
            referredBy: 'System',
            referredByEmail: 'system@example.com',
            status,
            emailFrom: 'orders@example.com',
            driverId: driver?.id,
        };
        jobs.push(job);
    }
    return jobs.sort((a,b) => new Date(b.orderDateTime).getTime() - new Date(a.orderDateTime).getTime());
};

// 4. Generate Invoices and Payments from Completed Jobs
const generateInvoicesAndPayments = (jobs: Job[], customers: Customer[]): { updatedJobs: Job[], invoices: Invoice[] } => {
    const invoices: Invoice[] = [];
    const completedJobs = jobs.filter(job => job.status === JobStatus.COMPLETED);

    completedJobs.forEach((job, index) => {
        const customer = customers.find(c => c.id === job.customerId);
        if (!customer) return;

        const jobDueDate = safeParseDate(job.dueDateTime);
        if (!jobDueDate) {
            console.warn(`Skipping invoice generation for job ${job.id} due to invalid dueDateTime.`);
            return;
        }

        const invoiceDate = new Date(jobDueDate);
        invoiceDate.setDate(invoiceDate.getDate() + 1);
        
        const daysToAdd = parsePaymentTermDays(customer.paymentTerms);
        const dueDate = new Date(invoiceDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        
        const subtotal = job.finalRate;
        const vatAmount = subtotal * 0.20;
        const totalAmount = subtotal + vatAmount;

        const newId = 77000 + index;
        const newRef = `ALS-${String(newId).padStart(6, '0')}`;

        const invoice: Invoice = {
            id: newId,
            invoice_ref: newRef,
            jobId: job.id,
            customerId: customer.id,
            customerDetails: {
                name: customer.name,
                address: customer.address,
                accountRef: customer.accountRef,
                paymentTerms: customer.paymentTerms,
            },
            jobDetails: {
                awbRef: job.awbRef,
                description: job.description,
                pcs: job.pcs,
                weight: job.weight,
                pickupAddress: job.pickupAddress,
                deliveryAddress: job.deliveryAddress,
                jobRef: customer.name,
            },
            invoiceDate: invoiceDate.toISOString(),
            dueDate: dueDate.toISOString(),
            subtotal,
            vatAmount,
            totalAmount,
            paidAmount: 0,
            outstandingAmount: totalAmount,
            credit_applied: 0,
            status: InvoiceStatus.UNPAID,
            paymentHistory: []
        };
        
        job.invoiceId = invoice.id;

        // Apply payments
        const paymentRoll = Math.random();
        if (paymentRoll < 0.5) { // 50% get fully paid
            const paymentDate = new Date(invoiceDate.getTime() + getRandomInt(5, 25) * 24 * 60 * 60 * 1000);
            invoice.paymentHistory.push({ date: paymentDate.toISOString().split('T')[0], amount: invoice.totalAmount, method: 'Cash' });
            invoice.paidAmount = invoice.totalAmount;
            invoice.outstandingAmount = 0;
            invoice.status = InvoiceStatus.PAID;
        } else if (paymentRoll < 0.8) { // 30% get partially paid
            const paymentAmount = parseFloat((invoice.totalAmount * (Math.random() * 0.7 + 0.1)).toFixed(2));
            const paymentDate = new Date(invoiceDate.getTime() + getRandomInt(5, 25) * 24 * 60 * 60 * 1000);
            invoice.paymentHistory.push({ date: paymentDate.toISOString().split('T')[0], amount: paymentAmount, method: 'Cash' });
            invoice.paidAmount = paymentAmount;
            invoice.outstandingAmount = invoice.totalAmount - paymentAmount;
            invoice.status = InvoiceStatus.PARTIALLY_PAID;
        }
        // The remaining 20% stay unpaid

        invoices.push(invoice);
    });
    
    return { updatedJobs: jobs, invoices: invoices.sort((a,b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()) };
};

// 5. Generate Credit Notes
const generateCreditNotes = (customers: Customer[]): CreditNote[] => {
    const creditNotes: CreditNote[] = [];
    const creditReasons = ["Service goodwill credit", "Refund for damaged goods", "Compensation for delay", "Annual rebate"];

    for (let i = 0; i < 5; i++) {
        const customer = getRandom(customers);
        const amount = getRandomInt(50, 500);
        const date = getRandomDate(new Date('2024-01-01'), new Date());
        
        const note: CreditNote = {
            id: 3000 + i,
            creditNoteRef: `CN-${String(date.getTime()).slice(-6)}`,
            customerId: customer.id,
            type: CreditNoteType.ACCOUNT_BASED,
            initialAmount: amount,
            remainingAmount: amount, // Initially full amount is remaining
            reason: getRandom(creditReasons),
            createdAt: date.toISOString(),
            status: CreditNoteStatus.ACTIVE,
            applications: [],
            history: [{
                date: date.toISOString(),
                action: 'CREATED',
                details: `Created with initial amount of £${amount.toFixed(2)}.`,
            }]
        };
        creditNotes.push(note);
    }
    return creditNotes.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};


// --- EXECUTE AND EXPORT ---

const DRIVER_COUNT = 10;
const JOB_COUNT = 500;

export const MOCK_CUSTOMERS = generateCustomers();
export const MOCK_DRIVERS = generateDrivers(DRIVER_COUNT);

const generatedJobs = generateJobs(JOB_COUNT, MOCK_CUSTOMERS, MOCK_DRIVERS);
const { updatedJobs, invoices } = generateInvoicesAndPayments(generatedJobs, MOCK_CUSTOMERS);

export const MOCK_JOBS = updatedJobs;
export const MOCK_INVOICES = invoices;
export const MOCK_CREDIT_NOTES = generateCreditNotes(MOCK_CUSTOMERS);

export const MOCK_USERS: User[] = [
    { id: 1, username: 'admin', role: 'admin', password: 'password' },
    { id: 2, username: 'testuser', role: 'admin', password: 'test' },
];