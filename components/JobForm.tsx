import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Job, JobFormData, ShipStatus, CalculationMethod, Customer } from '../types';
import { MAIN_SOURCES, VEHICLES } from '../constants';
import { SaveIcon, RefreshIcon, SparklesIcon, DocumentArrowUpIcon, DocumentTextIcon } from './icons';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<{ mimeType: string, data: string }> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimeTypePart, base64Data] = result.split(',');
            const mimeType = mimeTypePart.split(':')[1].split(';')[0];
            resolve({ mimeType, data: base64Data });
        };
        reader.onerror = (error) => reject(error);
    });

const jobSchema = {
  type: Type.OBJECT,
  properties: {
    company: { type: Type.STRING, description: "The name of the customer or company shipping the goods." },
    awbRef: { type: Type.STRING, description: "The Air Waybill (AWB) number or any unique reference code for the shipment." },
    department: { type: Type.STRING, description: "The relevant department, if mentioned." },
    pickupAddress: { type: Type.STRING, description: "The full address for collecting the goods." },
    deliveryAddress: { type: Type.STRING, description: "The full destination address for the goods." },
    description: { type: Type.STRING, description: "A brief description of the goods being shipped. Include any dates or times mentioned." },
    note: { type: Type.STRING, description: "Any special instructions or notes about the delivery." },
    pcs: { type: Type.INTEGER, description: "The number of pieces or items in the shipment." },
    weight: { type: Type.NUMBER, description: "The total weight of the shipment in kilograms (kg)." },
    dimensionH: { type: Type.NUMBER, description: "The height of the package(s) in meters." },
    dimensionL: { type: Type.NUMBER, description: "The length of the package(s) in meters." },
    dimensionW: { type: Type.NUMBER, description: "The width of the package(s) in meters." },
    distance: { type: Type.NUMBER, description: "The distance of the journey in miles, if mentioned." },
  },
  required: ["company", "awbRef", "pickupAddress", "deliveryAddress", "description"]
};

interface JobFormProps {
    job: Job | null;
    customers: Customer[];
    initialData?: Partial<JobFormData> | null;
    onSave: (jobData: JobFormData) => void;
    onCancel: () => void;
    tabId: string;
}

const initialFormData: JobFormData = {
    mainSource: MAIN_SOURCES[0],
    customerId: 0,
    company: '',
    department: '',
    awbRef: '',
    shipStatus: ShipStatus.NORMAL,
    pickupAddress: '',
    deliveryAddress: '',
    orderDateTime: new Date().toISOString().slice(0, 16),
    dueDateTime: new Date().toISOString().slice(0, 16),
    description: '',
    note: '',
    pcs: 0,
    weight: 0,
    dimensionH: 0,
    dimensionL: 0,
    dimensionW: 0,
    distance: 0,
    vehicle: VEHICLES[0].registration,
    calculationMethod: CalculationMethod.PIECES,
    finalRate: 0,
    referredBy: 'Admin',
    referredByEmail: 'admin@uklogistics.co.in',
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const JobForm: React.FC<JobFormProps> = ({ job, customers, initialData, onSave, onCancel, tabId }) => {
    const storageKey = `jobFormState-${tabId}-${job?.id || 'new'}`;
    
    const [formData, setFormData] = useState<JobFormData>(() => {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) { localStorage.removeItem(storageKey); }
        }
        return { ...initialFormData, customerId: customers[0]?.id || 0 };
    });

    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('manual');
    const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean | null>(null);
    
    // AI Creation state
    const [inputText, setInputText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    // Check for Gemini API key on mount if it's a new job
    useEffect(() => {
        if (!job) { // Only check for new jobs
            const checkApiKey = async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsApiKeyConfigured(false);
                    return;
                }
                try {
                    // This is a placeholder for a real API call
                    // const response = await fetch('/api/settings/api-keys/status', { headers: { 'Authorization': `Bearer ${token}` } });
                    // const data = await response.json();
                    // setIsApiKeyConfigured(data.isConfigured);
                    
                    // Mocked response for now
                    setTimeout(() => setIsApiKeyConfigured(true), 500);

                } catch (error) {
                    setIsApiKeyConfigured(false);
                }
            };
            checkApiKey();
        }
    }, [job]);

    useEffect(() => {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) return;

        if (job) {
            setFormData({
                id: job.id,
                mainSource: job.mainSource,
                customerId: job.customerId,
                company: job.company,
                department: job.department,
                awbRef: job.awbRef,
                shipStatus: job.shipStatus,
                pickupAddress: job.pickupAddress,
                deliveryAddress: job.deliveryAddress,
                orderDateTime: job.orderDateTime.slice(0, 16),
                dueDateTime: job.dueDateTime.slice(0, 16),
                description: job.description,
                note: job.note,
                pcs: job.pcs,
                weight: job.weight,
                dimensionH: job.dimensionH,
                dimensionL: job.dimensionL,
                dimensionW: job.dimensionW,
                distance: job.distance,
                vehicle: job.vehicle,
                calculationMethod: job.calculationMethod,
                finalRate: job.finalRate,
                referredBy: job.referredBy,
                referredByEmail: job.referredByEmail,
            });
        } else {
            const customerId = customers[0]?.id || 0;
            setFormData({
                ...initialFormData,
                customerId,
                ...(initialData || {}),
            });
        }
    }, [job, initialData, customers, storageKey]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(formData));
    }, [formData, storageKey]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleClear = () => {
        setFormData({ ...initialFormData, customerId: customers[0]?.id || 0 });
        setAiSuggestion(null);
        localStorage.removeItem(storageKey);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === formData.customerId);
        onSave({ ...formData, company: customer?.name || '' });
        localStorage.removeItem(storageKey);
    };

    const handleCancelClick = () => { onCancel(); };

    const handleAiValidation = async () => {
        setIsAiLoading(true);
        setAiSuggestion(null);
        try {
            const vehicleInfo = VEHICLES.find(v => v.registration === formData.vehicle);
            const prompt = `Validate the following job data and provide concise improvement suggestions. Start with "AI Suggestions: " or "AI Validation: All fields look reasonable.".

Job Data:
- AWB/Ref: ${formData.awbRef || 'N/A'}
- Pickup: ${formData.pickupAddress || 'N/A'}
- Delivery: ${formData.deliveryAddress || 'N/A'}
- Weight (kg): ${formData.weight}
- Vehicle: ${vehicleInfo ? `${vehicleInfo.type} (${vehicleInfo.registration})` : 'N/A'}

Rules:
1. AWB/Ref must not be empty.
2. Addresses must be present.
3. Suggest a more appropriate vehicle if weight > 2000kg and a small van is selected.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiSuggestion(response.text.trim());
        } catch (error) {
            setAiSuggestion("AI validation failed. Please try again.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleAiParse = async () => {
        if (!file && !inputText) {
            setAiError("Please upload a PDF or paste text to parse.");
            return;
        }
        setIsAiLoading(true);
        setAiError(null);
        try {
            const parts: any[] = [{ text: `You are a logistics data entry specialist. Extract job information from the following document or text. Populate the fields based on the content.` }];
            if (file) {
                const { mimeType, data } = await fileToBase64(file);
                parts.push({ inlineData: { mimeType, data } });
            } else {
                parts.push({ text: `\n\n--- DOCUMENT TEXT ---\n\n${inputText}`});
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts },
                config: { responseMimeType: "application/json", responseSchema: jobSchema },
            });
            
            const parsedJson = JSON.parse(response.text);
            const customer = customers.find(c => c.name.toLowerCase() === parsedJson.company?.toLowerCase());
            
            setFormData(prev => ({
                ...prev,
                ...parsedJson,
                customerId: customer?.id || prev.customerId,
            }));
            setCreationMode('manual');
        } catch (err) {
            setAiError("Failed to parse the document. Please try again or enter manually.");
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setAiError(null);
        }
    };


    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b border-brand-gray-200 pb-2">
                <h2 className="text-xl font-bold text-brand-blue-dark">{job ? 'Edit Job' : 'Create New Job'}</h2>
                {!job && (
                    <div className="flex border rounded-md p-0.5 bg-brand-gray-100">
                        <button onClick={() => setCreationMode('manual')} className={`px-3 py-1 text-sm rounded ${creationMode === 'manual' ? 'bg-white shadow' : 'text-gray-600'}`}>Manual Entry</button>
                        <button onClick={() => setCreationMode('ai')} disabled={!isApiKeyConfigured} className={`px-3 py-1 text-sm rounded ${creationMode === 'ai' ? 'bg-white shadow' : 'text-gray-600'} disabled:text-gray-400 disabled:cursor-not-allowed`} title={!isApiKeyConfigured ? "AI parsing unavailable – set API key in Super Admin profile." : ""}>AI Creation</button>
                    </div>
                )}
            </div>

            {creationMode === 'manual' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InputField label="Main Source" name="mainSource" value={formData.mainSource} onChange={handleChange} type="select" options={MAIN_SOURCES} />
                        <div>
                            <label htmlFor="customerId" className="text-sm font-medium text-gray-600">Company</label>
                             <select id="customerId" name="customerId" value={formData.customerId} onChange={handleCustomerChange} className="mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue" required>
                                <option value="" disabled>Select a customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <InputField label="Department" name="department" value={formData.department} onChange={handleChange} />
                        <InputField label="AWB/Ref" name="awbRef" value={formData.awbRef} onChange={handleChange} required/>
                        <InputField label="Ship Status" name="shipStatus" value={formData.shipStatus} onChange={handleChange} type="select" options={Object.values(ShipStatus)} />
                        <InputField label="Pickup From" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} className="col-span-1 md:col-span-2" />
                        <InputField label="Delivery Address" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} className="col-span-1 md:col-span-2" />
                        <InputField label="Order Date/Time" name="orderDateTime" value={formData.orderDateTime} onChange={handleChange} type="datetime-local" />
                        <InputField label="Due Date/Time" name="dueDateTime" value={formData.dueDateTime} onChange={handleChange} type="datetime-local" />
                        <InputField label="Description" name="description" value={formData.description} onChange={handleChange} type="textarea" className="col-span-1 md:col-span-2" />
                        <InputField label="Note" name="note" value={formData.note} onChange={handleChange} type="textarea" className="col-span-1 md:col-span-2" />
                        <InputField label="PCS" name="pcs" value={formData.pcs} onChange={handleChange} type="number" />
                        <InputField label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} type="number" />
                        <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-2">
                            <InputField label="H" name="dimensionH" value={formData.dimensionH} onChange={handleChange} type="number" />
                            <InputField label="L" name="dimensionL" value={formData.dimensionL} onChange={handleChange} type="number" />
                            <InputField label="W" name="dimensionW" value={formData.dimensionW} onChange={handleChange} type="number" />
                        </div>
                        <InputField label="Distance (miles)" name="distance" value={formData.distance} onChange={handleChange} type="number" />
                        <InputField label="Vehicle" name="vehicle" value={formData.vehicle} onChange={handleChange} type="select" options={VEHICLES.map(v => v.registration)} />
                        <InputField label="Calc Method" name="calculationMethod" value={formData.calculationMethod} onChange={handleChange} type="select" options={Object.values(CalculationMethod)} />
                        <InputField label="Final Rate (£)" name="finalRate" value={formData.finalRate} onChange={handleChange} type="number" />
                        <div className="col-span-1" />
                        <InputField label="Referred By" name="referredBy" value={formData.referredBy} onChange={handleChange} readOnly />
                        <InputField label="Ref. By Email" name="referredByEmail" value={formData.referredByEmail} onChange={handleChange} readOnly />
                    </div>
                    { (isAiLoading || aiSuggestion) && (
                        <div className={`mt-4 p-3 rounded-md text-sm flex items-center ${isAiLoading ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-900'}`}>
                           <SparklesIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                           {isAiLoading ? "AI is analyzing your data..." : aiSuggestion}
                        </div>
                    )}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-brand-gray-200">
                        <button type="button" onClick={handleAiValidation} disabled={isAiLoading || !isApiKeyConfigured} className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition disabled:bg-yellow-300">
                           <SparklesIcon className="w-5 h-5 mr-2" /> {isAiLoading ? 'Analyzing...' : 'AI Validate'}
                        </button>
                        <button type="button" onClick={handleCancelClick} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">Cancel</button>
                        <button type="button" onClick={handleClear} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
                            <RefreshIcon className="w-5 h-5 mr-2" /> Clear
                        </button>
                        <button type="submit" className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light">
                            <SaveIcon className="w-5 h-5 mr-2" /> {job ? 'Update Job' : 'Save Job'}
                        </button>
                    </div>
                </form>
            )}
            
            {creationMode === 'ai' && (
                <div className="p-4 border rounded-lg bg-brand-gray-50">
                    <div className="flex border-b mb-4">
                        <span className="flex items-center px-4 py-2 text-sm font-medium -mb-px border-b-2 border-brand-blue text-brand-blue">
                            <DocumentTextIcon className="w-5 h-5 mr-2" /> Paste Text or Upload PDF
                        </span>
                    </div>
                    <textarea value={inputText} onChange={(e) => { setInputText(e.target.value); setAiError(null); }} placeholder="Paste the job details from an email or document here..." className="w-full h-32 p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue" />
                    <div className="my-2 text-center text-xs text-gray-500 uppercase">OR</div>
                    <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                         <div className="flex flex-col items-center justify-center pt-5 pb-6">
                             <DocumentArrowUpIcon className="w-8 h-8 mb-2 text-gray-500" />
                             <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload PDF</span></p>
                             {file && <p className="mt-2 text-sm text-green-600 font-medium">{file.name}</p>}
                         </div>
                         <input id="pdf-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </label>
                    {aiError && <p className="mt-2 text-sm text-red-600">{aiError}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={handleCancelClick} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">Cancel</button>
                        <button onClick={handleAiParse} disabled={isAiLoading || (!file && !inputText)} className="flex items-center justify-center px-6 py-2.5 bg-brand-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition disabled:bg-yellow-300">
                            <SparklesIcon className="w-5 h-5 mr-2" /> {isAiLoading ? 'Parsing...' : 'Parse & Populate Form'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface InputFieldProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    type?: string;
    required?: boolean;
    readOnly?: boolean;
    options?: string[];
    className?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, type = 'text', className = '', ...props }) => {
    const commonClasses = "mt-1 w-full p-2 border rounded-md focus:ring-brand-blue focus:border-brand-blue disabled:bg-brand-gray-100";
    const renderField = () => {
        if (type === 'select') return <select id={name} name={name} className={commonClasses} {...props}>{props.options?.map(option => <option key={option} value={option}>{option}</option>)}</select>;
        if (type === 'textarea') return <textarea id={name} name={name} className={commonClasses} {...props} />;
        return <input id={name} name={name} type={type} className={commonClasses} {...props} />;
    };
    return (
        <div className={className}>
            <label htmlFor={name} className="text-sm font-medium text-gray-600">{label}</label>
            {renderField()}
        </div>
    );
};

export default JobForm;