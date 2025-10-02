import React from 'react';
import { Tab } from '../types';
import { PlusIcon, XMarkIcon } from './icons';

interface TabBarProps {
    tabs: Tab[];
    activeTabId: string;
    onSelectTab: (tabId: string) => void;
    onCloseTab: (tabId: string) => void;
    onAddTab: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onSelectTab, onCloseTab, onAddTab }) => {
    return (
        <div className="flex items-end border-b border-brand-gray-200">
            {tabs.map(tab => {
                const isActive = tab.id === activeTabId;
                return (
                    <div
                        key={tab.id}
                        onClick={() => onSelectTab(tab.id)}
                        className={`relative flex items-center h-10 px-4 -mb-px mr-1 cursor-pointer transition-colors duration-200 group border-t border-l border-r rounded-t-lg ${
                            isActive
                                ? 'bg-white text-brand-blue-dark border-brand-gray-200 shadow-sm'
                                : 'bg-brand-gray-100 hover:bg-brand-gray-200 text-gray-600 border-transparent'
                        }`}
                        role="tab"
                        aria-selected={isActive}
                    >
                        <tab.icon className={`w-5 h-5 mr-2 transition-colors ${isActive ? 'text-brand-blue' : 'text-gray-500 group-hover:text-gray-700'}`} />
                        <span className="text-sm font-medium whitespace-nowrap">{tab.title}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(tab.id);
                            }}
                            className={`ml-3 p-0.5 rounded-full transition-colors ${
                                isActive 
                                ? 'text-gray-500 hover:bg-red-100 hover:text-red-600'
                                : 'text-gray-400 hover:bg-brand-gray-300 hover:text-gray-700'
                            }`}
                            aria-label={`Close tab ${tab.title}`}
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
             <button
                onClick={onAddTab}
                className="flex items-center justify-center w-8 h-8 ml-1 mb-1 bg-brand-gray-200 hover:bg-brand-gray-300 text-gray-600 hover:text-gray-800 rounded-md transition-colors"
                aria-label="Add new tab"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default TabBar;