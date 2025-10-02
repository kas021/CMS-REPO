import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import TabBar from './components/TabBar';
import DataEntryPage from './components/DataEntryPage';
import DataManagementPage from './components/DataManagementPage';
import AccountsPage from './components/AccountsPage';
import ReportsPage from './components/ReportsPage';
import StartPage from './components/StartPage';
import CompanyDataPage from './components/CompanyDataPage';
import VersionHistoryPage from './components/VersionHistoryPage';
import SystemStatsPage from './components/SystemStatsPage';
import AccountsHubPage from './components/AccountsHubPage';
import StatementOfAccountsPage from './components/StatementOfAccountsPage';
import CreditNotesPage from './components/CreditNotesPage';
import VersionModal from './components/VersionModal';
import { Job, JobFormData, JobStatus, Tab, TabType, Customer, Driver, Invoice, InvoiceStatus, CompanyDetails, InvoiceTemplateSettings, CreditNote, CreditNoteFormData, Role, User, UserUpdateData, CreditNoteStatus, CreditNoteHistory, AppRole } from './types';
import { MOCK_JOBS, MOCK_CUSTOMERS, MOCK_DRIVERS, MOCK_INVOICES, MOCK_CREDIT_NOTES, MOCK_USERS } from './large-mock-data';
import { PlusIcon, TruckIcon, DocumentChartBarIcon, HomeIcon, BuildingOffice2Icon, InformationCircleIcon, CreditCardIcon, DocumentTextIcon, FolderIcon, ReceiptRefundIcon, UserCircleIcon } from './components/icons';
import { COMPANY_DETAILS as INITIAL_COMPANY_DETAILS, DEFAULT_INVOICE_TEMPLATE } from './constants';
import { safeParseDate, parsePaymentTermDays } from './utils/date';
import LoginTabs from './components/LoginTabs';
import ProfilePage from './components/ProfilePage';
import AccessDeniedPage from './components/AccessDeniedPage';
import DriverDashboard from './components/DriverDashboard';

const APP_VERSION = '5.1.1';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type AuthenticatedUser = {
    id: number;
    username: string;
    role: AppRole;
};


const App: React.FC = () => {
    // Auth State
    const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    
    // App Data State
    const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
    const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
    const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
    const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [creditNotes, setCreditNotes] = useState<CreditNote[]>(MOCK_CREDIT_NOTES);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
    const [animateAvatar, setAnimateAvatar] = useState(false);
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(INITIAL_COMPANY_DETAILS);
    const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplateSettings[]>([DEFAULT_INVOICE_TEMPLATE]);
    const [activeTemplateId, setActiveTemplateId] = useState<string>(DEFAULT_INVOICE_TEMPLATE.id);

    // Click handler state for avatar
    const clickCount = useRef(0);
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getTabInfo = (type: TabType): { title: string, icon: React.FC<{className?: string}> } => {
        switch (type) {
            case 'data-entry': return { title: 'Data Entry', icon: PlusIcon };
            case 'data-management': return { title: 'Data Management', icon: TruckIcon };
            case 'accounts-hub': return { title: 'Accounts Hub', icon: FolderIcon };
            case 'accounts': return { title: 'Invoicing', icon: CreditCardIcon };
            case 'sao': return { title: 'Statement of Accounts', icon: DocumentChartBarIcon };
            case 'credit-notes': return { title: 'Credit Notes', icon: ReceiptRefundIcon };
            case 'reports': return { title: 'Reports', icon: DocumentTextIcon };
            case 'company-data': return { title: 'Company Settings', icon: BuildingOffice2Icon };
            case 'version-history': return { title: 'Version History', icon: InformationCircleIcon };
            case 'system-stats': return { title: 'System Statistics', icon: DocumentChartBarIcon };
            case 'profile': return { title: 'Profile', icon: UserCircleIcon };
            case 'start':
            default: return { title: 'Start Page', icon: HomeIcon };
        }
    }
    
    const [tabs, setTabs] = useState<Tab[]>([
        { id: `tab-${Date.now()}`, type: 'start', ...getTabInfo('start') }
    ]);
    const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

    // Check auth status on initial load
    useEffect(() => {
        const verifyToken = async () => {
            const adminToken = localStorage.getItem('admin_token');
            const driverToken = localStorage.getItem('driver_token');
            const token = adminToken || driverToken;

            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser({ id: payload.sub_id || payload.sub, username: payload.sub, role: payload.role });
                    setAuthStatus('authenticated');
                } catch (e) {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('driver_token');
                    setUser(null);
                    setAuthStatus('unauthenticated');
                }
            } else {
                setAuthStatus('unauthenticated');
            }
        };
        verifyToken();
    }, []);


    const handleLogin = (token: string, loggedInUser: AuthenticatedUser) => {
        if (loggedInUser.role === 'driver') {
            localStorage.setItem('driver_token', token);
        } else {
            localStorage.setItem('admin_token', token);
        }
        setUser(loggedInUser);
        setAuthStatus('authenticated');
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('driver_token');
        setUser(null);
        setAuthStatus('unauthenticated');
        const newStartTab: Tab = { id: `tab-${Date.now()}`, type: 'start', ...getTabInfo('start') };
        setTabs([newStartTab]);
        setActiveTabId(newStartTab.id);
    };

     const openProfileTab = useCallback(() => {
        const existingTab = tabs.find(tab => tab.type === 'profile');
        if (existingTab) {
            setActiveTabId(existingTab.id);
        } else {
            handleAddTab('profile');
        }
    }, [tabs]);


    const handleAvatarClick = () => {
        openProfileTab();
        clickCount.current += 1;
        if (clickTimer.current) clearTimeout(clickTimer.current);
        if (clickCount.current === 3) {
            setAnimateAvatar(true);
            setIsVersionModalOpen(true);
            clickCount.current = 0;
            setTimeout(() => setAnimateAvatar(false), 500);
        } else {
            clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 500);
        }
    };
    
    const availableTabs = useMemo(() => {
        if (user?.role === 'admin') {
            return tabs.filter(tab => tab.type !== 'company-data' && tab.type !== 'system-stats' );
        }
        return tabs;
    }, [tabs, user]);
    
    const isTabAccessAllowed = (type: TabType): boolean => {
        if (user?.role === 'admin') {
            return type !== 'company-data' && type !== 'system-stats';
        }
        return true;
    };


    const handleAddTab = useCallback((type: TabType = 'start') => {
        if (!isTabAccessAllowed(type)) {
            return;
        }
        const newTabId = `tab-${Date.now()}`;
        const newTab: Tab = { id: newTabId, type, ...getTabInfo(type) };
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTabId(newTabId);
    }, [user]);

    const handleCloseTab = useCallback((tabIdToClose: string) => {
        if (tabs.length === 1) return;
        const newTabs = tabs.filter(t => t.id !== tabIdToClose);

        if (activeTabId === tabIdToClose) {
            let newActiveTabId: string;
            const correspondingAvailableTabIndex = availableTabs.findIndex(t => t.id === tabIdToClose);
            if (correspondingAvailableTabIndex > -1) {
                const newActiveIndex = Math.max(0, correspondingAvailableTabIndex - 1);
                newActiveTabId = availableTabs.length > 1 ? availableTabs[newActiveIndex].id : newTabs[0].id;
            } else {
                newActiveTabId = availableTabs.length > 0 ? availableTabs[0].id : newTabs[0].id;
            }
            setActiveTabId(newActiveTabId);
        }
        setTabs(newTabs);
    }, [tabs, activeTabId, availableTabs]);

    const handleSelectTab = useCallback((tabId: string) => { setActiveTabId(tabId); }, []);

    const handleNavigateInTab = useCallback((tabId: string, type: TabType) => {
        if (!isTabAccessAllowed(type)) {
             setTabs(prevTabs => prevTabs.map(tab =>
                tab.id === tabId ? { ...tab, type: 'access-denied', title: 'Access Denied', icon: InformationCircleIcon } : tab
            ));
            return;
        }
        setTabs(prevTabs => prevTabs.map(tab =>
            tab.id === tabId ? { ...tab, type, ...getTabInfo(type) } : tab
        ));
    }, [user]);

    const handleShowVersionHistory = useCallback(() => {
        const existingTab = tabs.find(tab => tab.type === 'version-history');
        if (existingTab) {
            setActiveTabId(existingTab.id);
        } else {
            handleAddTab('version-history');
        }
    }, [tabs, handleAddTab]);

    const handleSaveJob = useCallback((jobData: JobFormData) => {
        const sanitizedData = {
            ...jobData,
            pcs: parseFloat(String(jobData.pcs)) || 0,
            weight: parseFloat(String(jobData.weight)) || 0,
            dimensionH: parseFloat(String(jobData.dimensionH)) || 0,
            dimensionL: parseFloat(String(jobData.dimensionL)) || 0,
            dimensionW: parseFloat(String(jobData.dimensionW)) || 0,
            distance: parseFloat(String(jobData.distance)) || 0,
            finalRate: parseFloat(String(jobData.finalRate)) || 0,
        };

        let updatedJob: Job | undefined;
        setJobs(prevJobs => {
            if (sanitizedData.id) {
                return prevJobs.map(job => {
                    if (job.id === sanitizedData.id) {
                        updatedJob = { ...job, ...sanitizedData, id: job.id };
                        return updatedJob;
                    }
                    return job;
                });
            } else {
                const now = new Date().toISOString();
                const customer = customers.find(c => c.name === sanitizedData.company);
                const newJob: Job = {
                    ...(sanitizedData as Omit<Job, 'id' | 'status' | 'orderDateTime' | 'emailFrom' | 'customerId'>),
                    id: Date.now(),
                    status: JobStatus.PENDING,
                    orderDateTime: now,
                    dueDateTime: sanitizedData.dueDateTime || now,
                    emailFrom: sanitizedData.referredByEmail || 'manual@entry.com',
                    customerId: customer?.id || 0,
                };
                return [newJob, ...prevJobs];
            }
        });
        
        if (updatedJob?.invoiceId) {
            setInvoices(prevInvoices => prevInvoices.map(inv => {
                if (inv.id === updatedJob?.invoiceId) {
                     const subtotal = updatedJob.finalRate;
                     const vatAmount = subtotal * 0.20;
                     const totalAmount = subtotal + vatAmount;
                     const outstandingAmount = totalAmount - inv.paidAmount - inv.credit_applied;
                    return {
                        ...inv,
                        subtotal,
                        vatAmount,
                        totalAmount,
                        outstandingAmount: Math.max(0, outstandingAmount),
                        status: outstandingAmount <= 0 ? (inv.paidAmount > 0 ? InvoiceStatus.PAID : InvoiceStatus.SETTLED_WITH_CREDIT) : inv.status,
                    };
                }
                return inv;
            }));
        }
    }, [customers]);

    const handleDeleteJob = useCallback((jobId: number) => { setJobs(prev => prev.filter(j => j.id !== jobId)); }, []);
    const handleDeleteJobs = useCallback((jobIds: number[]) => { setJobs(prev => prev.filter(j => !jobIds.includes(j.id))); }, []);

    const handleUpdateJobStatus = useCallback((jobIds: number[], status: JobStatus) => {
        const updatedJobs = jobs.map(job => {
            if (jobIds.includes(job.id)) {
                const newJobData: Partial<Job> = { ...job, status };
                if (status === JobStatus.PENDING || status === JobStatus.CANCELLED) {
                    newJobData.driverId = undefined;
                }
                return newJobData as Job;
            }
            return job;
        });

        if (status === JobStatus.COMPLETED) {
            const newlyCompletedJobs = updatedJobs.filter(job => jobIds.includes(job.id) && !job.invoiceId);

            const existingInvoiceNumbers = invoices
                .map(inv => parseInt(inv.invoice_ref.replace('ALS-', ''), 10))
                .filter(num => !isNaN(num));
            
            const maxInvoiceNum = existingInvoiceNumbers.length > 0 ? Math.max(...existingInvoiceNumbers) : 77000;

            const newInvoices: Invoice[] = newlyCompletedJobs.map((job, index) => {
                const customer = customers.find(c => c.id === job.customerId);
                if (!customer) return null;

                const invoiceDate = new Date();
                const dueDate = new Date();
                dueDate.setDate(invoiceDate.getDate() + parsePaymentTermDays(customer.paymentTerms));
                
                const subtotal = job.finalRate;
                const vatAmount = subtotal * 0.20;
                const totalAmount = subtotal + vatAmount;

                const newInvoiceId = Date.now() + job.id;
                const newInvoiceNumber = maxInvoiceNum + index + 1;
                const newInvoiceRef = `ALS-${String(newInvoiceNumber).padStart(6, '0')}`;

                const newInvoice: Invoice = {
                    id: newInvoiceId,
                    invoice_ref: newInvoiceRef,
                    jobId: job.id, 
                    customerId: customer.id,
                    customerDetails: { name: customer.name, address: customer.address, accountRef: customer.accountRef, paymentTerms: customer.paymentTerms },
                    jobDetails: { awbRef: job.awbRef, description: job.description, pcs: job.pcs, weight: job.weight, pickupAddress: job.pickupAddress, deliveryAddress: job.deliveryAddress, jobRef: customer.name },
                    invoiceDate: invoiceDate.toISOString(), dueDate: dueDate.toISOString(), subtotal, vatAmount, totalAmount, paidAmount: 0, outstandingAmount: totalAmount, credit_applied: 0, status: InvoiceStatus.UNPAID, paymentHistory: []
                };
                job.invoiceId = newInvoice.id;
                return newInvoice;
            }).filter((inv): inv is Invoice => inv !== null);

            if (newInvoices.length > 0) {
                let creditNotesToUpdate = [...creditNotes];
                const processedInvoices = newInvoices.map(invoice => {
                    let currentInvoice = { ...invoice, paymentHistory: [...invoice.paymentHistory] };
                    let outstanding = currentInvoice.outstandingAmount;
                    if (outstanding <= 0) return currentInvoice;
    
                    const customerCreditNotes = creditNotesToUpdate
                        .filter(cn => cn.customerId === currentInvoice.customerId && cn.remainingAmount > 0)
                        .sort((a, b) => (safeParseDate(a.createdAt)?.getTime() || 0) - (safeParseDate(b.createdAt)?.getTime() || 0));
    
                    for (const creditNote of customerCreditNotes) {
                        if (outstanding <= 0) break;
                        const amountToApply = parseFloat(Math.min(outstanding, creditNote.remainingAmount).toFixed(2));
    
                        currentInvoice.credit_applied = (currentInvoice.credit_applied || 0) + amountToApply;
                        currentInvoice.outstandingAmount = parseFloat((currentInvoice.outstandingAmount - amountToApply).toFixed(2));
                        currentInvoice.paymentHistory.push({
                            date: new Date().toISOString(),
                            amount: amountToApply,
                            method: 'Credit Note',
                            creditNoteId: creditNote.id
                        });
    
                        creditNote.remainingAmount = parseFloat((creditNote.remainingAmount - amountToApply).toFixed(2));
                        creditNote.applications.push({
                            date: new Date().toISOString(),
                            appliedAmount: amountToApply,
                            invoiceId: currentInvoice.id,
                        });
    
                        outstanding -= amountToApply;
                    }
    
                    if (currentInvoice.outstandingAmount <= 0.01) {
                        currentInvoice.outstandingAmount = 0;
                        if (currentInvoice.paidAmount > 0) {
                            currentInvoice.status = InvoiceStatus.PAID;
                        } else {
                            currentInvoice.status = InvoiceStatus.SETTLED_WITH_CREDIT;
                        }
                    } else if (currentInvoice.paidAmount > 0 || currentInvoice.credit_applied > 0) {
                        currentInvoice.status = InvoiceStatus.PARTIALLY_PAID;
                    }
    
                    return currentInvoice;
                });
                
                setInvoices(prev => [...prev, ...processedInvoices]);
                setCreditNotes(creditNotesToUpdate);
            }
        }
        setJobs(updatedJobs);
    }, [jobs, customers, creditNotes, invoices]);

    const handleAssignDriverToJobs = useCallback((jobIds: number[], driverId: number) => {
        const driver = drivers.find(d => d.id === driverId);
        if (!driver) return;
        setJobs(prevJobs => prevJobs.map(job => 
            jobIds.includes(job.id) 
            ? { ...job, status: JobStatus.ASSIGNED, driverId: driver.id } 
            : job
        ));
    }, [drivers]);

    const handleRecordPayment = useCallback((invoiceId: number, paymentAmount: number, paymentDate: string) => {
        let updatedCreditNotes = [...creditNotes];
        let targetInvoice: Invoice | undefined;

        const updatedInvoices = invoices.map(inv => {
            if (inv.id !== invoiceId) return inv;

            targetInvoice = { ...inv };
            targetInvoice.paidAmount += paymentAmount;
            targetInvoice.paymentHistory.push({ date: paymentDate, amount: paymentAmount, method: 'Cash' });
            let creditToReturn = 0;
            const creditApplications = targetInvoice.paymentHistory.filter(p => p.method === 'Credit Note');
            
            for (const app of creditApplications) {
                const creditNote = updatedCreditNotes.find(cn => cn.id === app.creditNoteId);
                if (creditNote) {
                    creditNote.remainingAmount += app.amount;
                    creditToReturn += app.amount;
                }
            }

            targetInvoice.credit_applied = 0;
            targetInvoice.paymentHistory = targetInvoice.paymentHistory.filter(p => p.method !== 'Credit Note');
            
            let outstanding = targetInvoice.totalAmount - targetInvoice.paidAmount;

            if (outstanding > 0) {
                const customerCreditNotes = updatedCreditNotes
                    .filter(cn => cn.customerId === targetInvoice!.customerId && cn.remainingAmount > 0)
                    .sort((a, b) => (safeParseDate(a.createdAt)?.getTime() || 0) - (safeParseDate(b.createdAt)?.getTime() || 0));
                
                for (const creditNote of customerCreditNotes) {
                    if (outstanding <= 0) break;
                    const amountToApply = Math.min(outstanding, creditNote.remainingAmount);

                    targetInvoice.credit_applied += amountToApply;
                    targetInvoice.paymentHistory.push({
                        date: new Date().toISOString(),
                        amount: amountToApply,
                        method: 'Credit Note',
                        creditNoteId: creditNote.id
                    });
                    
                    creditNote.remainingAmount -= amountToApply;
                    outstanding -= amountToApply;
                }
            }
            
            targetInvoice.outstandingAmount = Math.max(0, outstanding);

            if (targetInvoice.outstandingAmount <= 0.01) {
                targetInvoice.outstandingAmount = 0;
                if (targetInvoice.paidAmount > 0) {
                    targetInvoice.status = InvoiceStatus.PAID;
                } else {
                    targetInvoice.status = InvoiceStatus.SETTLED_WITH_CREDIT;
                }
            } else {
                targetInvoice.status = InvoiceStatus.PARTIALLY_PAID;
            }

            return targetInvoice;
        });

        setInvoices(updatedInvoices);
        setCreditNotes(updatedCreditNotes);
    }, [invoices, creditNotes]);


    const handleBulkPayInvoices = useCallback((invoiceIds: number[], amount: number | null, paymentDate: string) => {
        setInvoices(prevInvoices => {
            const invoicesToUpdate = prevInvoices.filter(inv => invoiceIds.includes(inv.id)).sort((a, b) => (safeParseDate(a.invoiceDate)?.getTime() || 0) - (safeParseDate(b.invoiceDate)?.getTime() || 0));
            let remainingPayment = amount;
            return prevInvoices.map(originalInvoice => {
                const invoiceToProcess = invoicesToUpdate.find(i => i.id === originalInvoice.id);
                if (!invoiceToProcess) return originalInvoice;
                let paymentForThisInvoice = 0;
                if (remainingPayment === null) {
                    paymentForThisInvoice = invoiceToProcess.outstandingAmount;
                } else {
                    if (remainingPayment <= 0) return originalInvoice;
                    paymentForThisInvoice = Math.min(remainingPayment, invoiceToProcess.outstandingAmount);
                    remainingPayment -= paymentForThisInvoice;
                }
                if (paymentForThisInvoice <= 0) return originalInvoice;
                const newPaidAmount = invoiceToProcess.paidAmount + paymentForThisInvoice;
                const newOutstandingAmount = invoiceToProcess.totalAmount - newPaidAmount - invoiceToProcess.credit_applied;
                let newStatus = newOutstandingAmount <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;
                return { ...invoiceToProcess, paidAmount: newPaidAmount, outstandingAmount: Math.max(0, newOutstandingAmount), status: newStatus, paymentHistory: [...invoiceToProcess.paymentHistory, { date: paymentDate, amount: paymentForThisInvoice, method: 'Cash' }] };
            });
        });
    }, []);

    const handleAddCustomer = useCallback((customerData: Omit<Customer, 'id'>) => { setCustomers(prev => [...prev, { ...customerData, id: Date.now() }]); }, []);
    const handleAddDriver = useCallback((driverData: Omit<Driver, 'id'>) => { setDrivers(prev => [...prev, { ...driverData, id: Date.now() }]); }, []);
    const handleUpdateDriver = useCallback((driverData: Driver) => {
        setDrivers(prev => prev.map(d => d.id === driverData.id ? driverData : d));
    }, []);

    const handleAddCreditNote = useCallback((noteData: CreditNoteFormData) => {
        const newNote: CreditNote = {
            ...noteData,
            id: Date.now(),
            creditNoteRef: `CN-${String(Date.now()).slice(-6)}`,
            createdAt: new Date().toISOString(),
            remainingAmount: noteData.initialAmount,
            applications: [],
            status: CreditNoteStatus.ACTIVE,
            history: [{ date: new Date().toISOString(), action: 'CREATED', details: `Created with initial amount of £${noteData.initialAmount.toFixed(2)} by ${user?.username}.` }]
        };
        setCreditNotes(prev => [newNote, ...prev].sort((a,b) => (safeParseDate(b.createdAt)?.getTime() || 0) - (safeParseDate(a.createdAt)?.getTime() || 0)));
    }, [user]);

    const handleVoidCreditNote = useCallback((noteId: number) => {
        let affectedInvoiceIds: number[] = [];
        setCreditNotes(prev => prev.map(cn => {
            if (cn.id === noteId) {
                cn.applications.forEach(app => affectedInvoiceIds.push(app.invoiceId));
                return { 
                    ...cn, 
                    remainingAmount: 0, 
                    status: CreditNoteStatus.VOIDED,
                    history: [...cn.history, { date: new Date().toISOString(), action: 'VOIDED', details: `Note voided by ${user?.username}.` }]
                };
            }
            return cn;
        }));

        if (affectedInvoiceIds.length > 0) {
            setInvoices(prev => prev.map(inv => {
                if (affectedInvoiceIds.includes(inv.id)) {
                    const outstanding = inv.totalAmount - inv.paidAmount;
                    return {
                        ...inv,
                        credit_applied: 0,
                        outstandingAmount: outstanding,
                        status: outstanding <= 0 ? (inv.paidAmount > 0 ? InvoiceStatus.PAID : InvoiceStatus.UNPAID) : InvoiceStatus.PARTIALLY_PAID,
                        paymentHistory: inv.paymentHistory.filter(p => p.method !== 'Credit Note')
                    };
                }
                return inv;
            }));
        }

    }, [user]);
    
    const handleEditCreditNote = useCallback((noteId: number, data: { reason?: string, remainingAmount?: number }) => {
        setCreditNotes(prev => prev.map(cn => {
            if (cn.id === noteId) {
                 const newHistory: CreditNoteHistory[] = [];
                 if(data.reason && data.reason !== cn.reason) {
                    newHistory.push({ date: new Date().toISOString(), action: 'EDITED_REASON', details: `Reason updated from "${cn.reason}" to "${data.reason}" by ${user?.username}.` });
                 }
                 if(data.remainingAmount !== undefined && data.remainingAmount !== cn.remainingAmount) {
                    newHistory.push({ date: new Date().toISOString(), action: 'EDITED_BALANCE', details: `Balance manually adjusted from £${cn.remainingAmount.toFixed(2)} to £${data.remainingAmount.toFixed(2)} by ${user?.username}.` });
                 }

                 return { 
                    ...cn,
                    reason: data.reason ?? cn.reason,
                    remainingAmount: data.remainingAmount ?? cn.remainingAmount,
                    history: [...cn.history, ...newHistory]
                };
            }
            return cn;
        }));
    }, [user]);

    const handleManualApplyCredit = useCallback((noteId: number, invoiceId: number, amount: number) => {
        let updatedNote: CreditNote | null = null;
        let updatedInvoice: Invoice | null = null;

        setCreditNotes(prev => prev.map(cn => {
            if (cn.id === noteId) {
                updatedNote = {
                    ...cn,
                    remainingAmount: cn.remainingAmount - amount,
                    applications: [...cn.applications, { date: new Date().toISOString(), appliedAmount: amount, invoiceId }],
                    history: [...cn.history, { date: new Date().toISOString(), action: 'MANUAL_APPLICATION', details: `Manually applied £${amount.toFixed(2)} to invoice ID ${invoiceId} by ${user?.username}.`}]
                };
                return updatedNote;
            }
            return cn;
        }));

        setInvoices(prev => prev.map(inv => {
            if (inv.id === invoiceId) {
                const newCreditApplied = inv.credit_applied + amount;
                const newOutstanding = inv.totalAmount - inv.paidAmount - newCreditApplied;
                let newStatus = inv.status;
                if (newOutstanding <= 0.01) {
                    newStatus = inv.paidAmount > 0 ? InvoiceStatus.PAID : InvoiceStatus.SETTLED_WITH_CREDIT;
                } else {
                    newStatus = InvoiceStatus.PARTIALLY_PAID;
                }

                updatedInvoice = {
                    ...inv,
                    credit_applied: newCreditApplied,
                    outstandingAmount: Math.max(0, newOutstanding),
                    status: newStatus,
                    paymentHistory: [...inv.paymentHistory, { date: new Date().toISOString(), amount, method: 'Credit Note', creditNoteId: noteId }]
                };
                return updatedInvoice;
            }
            return inv;
        }));
    }, [user]);


    const handleUpdateTemplate = useCallback((updatedTemplate: InvoiceTemplateSettings) => {
        setInvoiceTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    }, []);

    const handleAddTemplate = useCallback((name: string) => {
        const newTemplate = { ...DEFAULT_INVOICE_TEMPLATE, id: `template-${Date.now()}`, name };
        setInvoiceTemplates(prev => [...prev, newTemplate]);
        setActiveTemplateId(newTemplate.id);
    }, []);
    
    const handleResetTemplate = useCallback((templateId: string) => {
        setInvoiceTemplates(prev => prev.map(t => t.id === templateId ? { ...DEFAULT_INVOICE_TEMPLATE, id: t.id, name: t.name } : t));
    }, []);

    const handleAddUser = useCallback((username: string, password: string) => {
        const newUser: User = { id: Date.now(), username, password, role: 'admin' };
        setUsers(prev => [...prev, newUser]);
    }, []);

    const handleUpdateUser = useCallback((userData: UserUpdateData) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userData.id) {
                return { 
                    ...u, 
                    username: userData.username || u.username,
                    password: userData.password || u.password
                };
            }
            return u;
        }));
    }, []);

    const handleDeleteUser = useCallback((userId: number) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    }, []);


    const renderPage = (tab: Tab) => {
        if (!isTabAccessAllowed(tab.type)) {
            return <AccessDeniedPage />;
        }
        
        const pageProps = { jobs, drivers, customers, invoices, onSaveJob: handleSaveJob, onDeleteJob: handleDeleteJob, onDeleteJobs: handleDeleteJobs, onUpdateStatus: handleUpdateJobStatus, onAssignDriver: handleAssignDriverToJobs };
        const activeTemplate = invoiceTemplates.find(t => t.id === activeTemplateId) || invoiceTemplates[0] || DEFAULT_INVOICE_TEMPLATE;
        const formProps = { tabId: tab.id };
        
        switch (tab.type) {
            case 'start': return <StartPage onNavigate={(type) => handleNavigateInTab(tab.id, type)} companyDetails={companyDetails} />;
            case 'data-entry': return <DataEntryPage {...pageProps} {...formProps} />;
            case 'data-management': return <DataManagementPage {...pageProps} {...formProps} />;
            case 'accounts-hub': return <AccountsHubPage onNavigate={(type) => handleNavigateInTab(tab.id, type)} />;
            case 'accounts': return <AccountsPage invoices={invoices} jobs={jobs} customers={customers} onRecordPayment={handleRecordPayment} onSaveJob={handleSaveJob} onBulkPayInvoices={handleBulkPayInvoices} onNavigateBack={() => handleNavigateInTab(tab.id, 'accounts-hub')} companyDetails={companyDetails} activeTemplate={activeTemplate} tabId={tab.id} />;
            case 'sao': return <StatementOfAccountsPage invoices={invoices} customers={customers} onNavigateBack={() => handleNavigateInTab(tab.id, 'accounts-hub')} />;
            case 'credit-notes': return <CreditNotesPage creditNotes={creditNotes} customers={customers} invoices={invoices} onAddCreditNote={handleAddCreditNote} onNavigateBack={() => handleNavigateInTab(tab.id, 'accounts-hub')} onVoidCreditNote={handleVoidCreditNote} onEditCreditNote={handleEditCreditNote} onManualApplyCredit={handleManualApplyCredit} user={user as User} {...formProps} />;
            case 'reports': return <ReportsPage />;
            case 'company-data': return <CompanyDataPage customers={customers} drivers={drivers} onAddCustomer={handleAddCustomer} onAddDriver={handleAddDriver} onUpdateDriver={handleUpdateDriver} companyDetails={companyDetails} onUpdateCompanyDetails={setCompanyDetails} invoiceTemplates={invoiceTemplates} onUpdateTemplate={handleUpdateTemplate} onAddTemplate={handleAddTemplate} onResetTemplate={handleResetTemplate} activeTemplateId={activeTemplateId} onSetActiveTemplateId={setActiveTemplateId} onSetInvoiceTemplates={setInvoiceTemplates} />;
            case 'version-history': return <VersionHistoryPage />;
            case 'system-stats': return <SystemStatsPage jobs={jobs} invoices={invoices} customers={customers} drivers={drivers} />;
            case 'profile': return <ProfilePage user={user as User} onLogout={handleLogout} users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />;
            case 'access-denied': return <AccessDeniedPage />;
            default: return <StartPage onNavigate={(type) => handleNavigateInTab(tab.id, type)} companyDetails={companyDetails} />;
        }
    };
    
    if (authStatus === 'loading') {
        return <div className="flex items-center justify-center h-screen"><p className="text-brand-blue-dark">Loading...</p></div>;
    }

    if (authStatus === 'unauthenticated') {
        return <LoginTabs onLogin={handleLogin} />;
    }

    if (user?.role === 'driver') {
        return <DriverDashboard user={user} onLogout={handleLogout} />;
    }

    return (
        <div className="flex flex-col h-screen font-sans antialiased text-brand-gray-900">
            <style>{`@keyframes avatar-pop { 0% { transform: scale(1); box-shadow: 0 0 0 rgba(240, 173, 78, 0.4); } 50% { transform: scale(1.1) rotate(10deg); box-shadow: 0 0 20px rgba(240, 173, 78, 0.8); } 100% { transform: scale(1); box-shadow: 0 0 0 rgba(240, 173, 78, 0.4); } } .avatar-animate { animation: avatar-pop 0.5s ease-in-out; }`}</style>
             <VersionModal isOpen={isVersionModalOpen} onClose={() => setIsVersionModalOpen(false)} version={APP_VERSION} onShowHistory={handleShowVersionHistory} />
            <header className="bg-white shadow-sm">
                 <div className="flex items-center justify-between px-4 py-2 border-b border-brand-gray-200">
                    <div className="flex items-center">
                        <img src={companyDetails.logo} alt={`${companyDetails.name} logo`} className="h-8 w-auto mr-3 object-contain" />
                        <TabBar tabs={availableTabs} activeTabId={activeTabId} onSelectTab={handleSelectTab} onCloseTab={handleCloseTab} onAddTab={() => handleAddTab('start')} />
                    </div>
                    <div className="pb-1 ml-4" onClick={handleAvatarClick} style={{ cursor: 'pointer' }} title="Click for Profile or 3 times for Version!">
                         <img className={`w-8 h-8 rounded-full object-cover border-2 border-brand-accent ${animateAvatar ? 'avatar-animate' : ''}`} src="https://picsum.photos/100/100" alt="User Avatar" />
                     </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-brand-gray-100 p-4 md:p-6 relative">
                <div className="bg-white rounded-lg shadow-md h-full overflow-y-hidden relative">
                   {tabs.map(tab => (
                       <div key={tab.id} style={{ display: tab.id === activeTabId ? 'block' : 'none' }} className="h-full overflow-y-auto">
                           {renderPage(tab)}
                       </div>
                   ))}
                </div>
                 <div className="absolute bottom-2 right-4 text-xs text-brand-gray-500 font-mono">
                    Version {APP_VERSION}
                </div>
            </main>
        </div>
    );
};

export default App;
