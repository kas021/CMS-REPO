import React from 'react';
import { InformationCircleIcon } from './icons';

const VersionHistoryPage: React.FC = () => {
    return (
        <div className="p-6 md:p-8 space-y-8 bg-white rounded-lg shadow-md">
            <header className="flex items-center space-x-3">
                <InformationCircleIcon className="w-8 h-8 text-brand-blue" />
                <h1 className="text-2xl font-bold text-brand-blue-dark">Version History</h1>
            </header>

            <main className="prose max-w-none text-gray-800 prose-h2:text-brand-blue-dark prose-h2:border-b prose-h2:pb-2 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1 prose-strong:text-brand-blue-dark">
                <section>
                    <h2>Version 5.1.1</h2>
                    <p className="text-sm text-gray-500">Released: 2024-07-08</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Multi-Role Login System</strong>
                             <ul>
                                <li><strong>NEW:</strong> The login screen now features a tabbed interface for "Admin," "Driver," and "Customer" roles.</li>
                                <li><strong>NEW:</strong> Implemented a fully functional Driver login that authenticates against the backend (`/drivers/token`). Authenticated drivers are redirected to a new placeholder Driver Dashboard.</li>
                                <li><strong>NEW:</strong> Added a placeholder "Customer" login tab for future development.</li>
                                <li><strong>REFACTOR:</strong> The application's core authentication logic was overhauled to handle role-specific tokens and conditional routing based on user role.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>ENHANCEMENT: Driver Data Management</strong>
                             <ul>
                                <li><strong>NEW:</strong> The Driver management panel in Company Settings now includes fields for `email` and `password`, allowing admins to manage driver credentials.</li>
                                <li><strong>DATA:</strong> The Driver data model (`types.ts`) and mock data generation were updated to support the new authentication fields.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 5.1.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-07-07</p>
                     <ul>
                        <li>
                            <strong>MAJOR FEATURE: Driver System Scaffolding &amp; API</strong>
                             <ul>
                                {/* FIX: Escaped curly braces to prevent JSX parsing error. */}
                                <li><strong>NEW:</strong> Created a complete set of secure, driver-specific API endpoints, including driver login (`/drivers/token`), viewing assigned jobs (`/drivers/me/jobs`), and updating job status (`/jobs/{'{'}job_id{'}'}/..`).</li>
                                <li><strong>NEW:</strong> Added an endpoint for uploading Proof of Delivery (POD), which simulates saving to object storage.</li>
                                <li><strong>SECURITY:</strong> Implemented a "driver" role and a new security dependency (`get_current_driver`) to protect all driver-related endpoints.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>FEATURE: Driver Credential Management</strong>
                             <ul>
                                <li><strong>NEW:</strong> The "Company Data → Drivers" page now allows Super Admins to manage driver credentials (email, password) directly.</li>
                                <li><strong>DB:</strong> The `drivers` table schema was updated to include `email` and `hashed_password` fields. The `jobs` table was updated to support new statuses (`EN_ROUTE`, `DELIVERED`).</li>
                            </ul>
                        </li>
                         <li>
                            <strong>DOCS:</strong> Updated `README.md` to version 5.1.0 and added comprehensive documentation for all new Driver API endpoints.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 5.0.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-07-06</p>
                    <ul>
                        <li>
                            <strong>MAJOR FEATURE: PostgreSQL &amp; Alembic Migration</strong>
                             <ul>
                                <li><strong>NEW:</strong> Migrated the entire backend from SQLite to PostgreSQL for production-readiness.</li>
                                <li><strong>NEW:</strong> Integrated Alembic for robust database schema migrations. Includes initial migration script for all tables.</li>
                                <li><strong>DOCS:</strong> Updated <code>README.md</code> with detailed instructions on setting up a local PostgreSQL database, configuring the <code>DATABASE_URL</code>, and running Alembic migrations.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>FEATURE: Driver Location Tracking</strong>
                             <ul>
                                <li><strong>NEW:</strong> Added a new <code>DriverLocation</code> model to track driver coordinates and timestamps.</li>
                                <li><strong>NEW:</strong> Added API endpoints for creating and managing driver locations.</li>
                                <li><strong>NEW:</strong> Implemented a daily cleanup task (via a protected API endpoint) to remove location data older than 7 days, ensuring data privacy and performance.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>REFACTOR: Backend Organization</strong>
                            <ul>
                                <li><strong>ENHANCEMENT:</strong> Reorganized backend routers into separate files by resource (`customers`, `drivers`, `tasks`, etc.) for improved maintainability.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>DEPS:</strong> Updated <code>requirements.txt</code> with <code>psycopg2-binary</code> and <code>alembic</code>.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.2.5</h2>
                    <p className="text-sm text-gray-500">Released: 2024-07-05</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Super Admin Exclusive Credit Controls</strong> - Implemented advanced, super-admin-only features for granular control over the credit system.
                             <ul>
                                <li><strong>NEW:</strong> Super Admins can now manually edit a credit note's remaining balance.</li>
                                <li><strong>NEW:</strong> Super Admins can now manually apply credit from a specific note to any of a customer's outstanding invoices.</li>
                                <li><strong>NEW:</strong> The credit note history now provides a detailed audit trail for all Super Admin actions, logging the user, the action performed (e.g., "Balance manually adjusted"), and the values changed.</li>
                                <li><strong>SECURITY:</strong> All new credit control features are protected on both the frontend (UI elements are hidden) and the backend (API endpoints require super_admin role).</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.2.4</h2>
                    <p className="text-sm text-gray-500">Released: 2024-07-04</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Advanced Credit Note System</strong> - Implemented a comprehensive overhaul of the credit note system for improved financial tracking and control.
                             <ul>
                                <li><strong>NEW:</strong> Invoices fully settled by credit are now marked with a new status: <code>"Settled with Credit"</code>.</li>
                                <li><strong>NEW:</strong> Recording a cash payment on a credit-settled invoice now correctly reverses the credit application, returning the unused credit amount to the customer's balance.</li>
                                <li><strong>NEW:</strong> Added a complete credit history log, tracking creation, application, and voiding of notes.</li>
                                <li><strong>NEW:</strong> Super Admins can now void or edit existing credit notes, with all actions logged in the history for a full audit trail.</li>
                                <li><strong>UI:</strong> The Statement of Accounts now includes a "Credit Applied" column for full transparency.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.2.3</h2>
                    <p className="text-sm text-gray-500">Released: 2024-07-03</p>
                    <ul>
                        <li>
                            <strong>FIX: Refined Credit Note Logic</strong> - Fixed credit note logic to improve accounting accuracy.
                             <ul>
                                <li><strong>NEW:</strong> Invoices fully covered by a credit note are no longer automatically marked as "Paid." They are now flagged with a new status: <code>"Settled via Credit Note"</code>.</li>
                                <li><strong>ENHANCEMENT:</strong> The "Paid" status is now reserved for invoices that have received a cash or bank payment.</li>
                                <li><strong>UI:</strong> The Invoicing page now has a new filter tab and a distinct status chip for "Settled by Credit" invoices, providing a clearer financial overview.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.2.2</h2>
                    <p className="text-sm text-gray-500">Released: 2024-07-02</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Super Admin API Key Management</strong> - Added a new "API Keys" section in the Super Admin profile page.
                             <ul>
                                <li><strong>NEW:</strong> Super Admins can now view, add, and update API keys (e.g., for Gemini) which are securely stored in the database.</li>
                                <li><strong>NEW:</strong> Added new backend endpoints (<code>/settings/api-keys</code>) to manage keys securely.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>FEATURE: Improved Job Creation Workflow</strong> - Streamlined the job creation process.
                            <ul>
                                <li><strong>ENHANCEMENT:</strong> Clicking "Add New Job" now defaults to the manual creation form for faster entry.</li>
                                <li><strong>ENHANCEMENT:</strong> The <code>JobForm</code> now includes an "AI Creation" tab, which allows for parsing from text or PDF. This tab is disabled if the necessary API key is not configured.</li>
                                <li><strong>REFACTOR:</strong> Removed the old <code>ParseJobModal</code> and integrated its functionality directly into the <code>JobForm</code>.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>REFACTOR: Removed "Target Rate"</strong>
                            <ul>
                                <li><strong>ENHANCEMENT:</strong> Removed the <code>targetRate</code> field from the entire application (UI, state, backend) in favor of using only <code>finalRate</code>. This simplifies the data model and reduces user confusion.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.2.1</h2>
                    <p className="text-sm text-gray-500">Released: 2024-07-01</p>
                    <ul>
                        <li>
                            <strong>BACKEND: End-to-End Test &amp; Bug Fixes</strong> - Added an end-to-end test workflow for the entire job-to-payment lifecycle.
                            <ul>
                                <li><strong>NEW:</strong> Created a new <code>/testing/run-e2e-workflow</code> endpoint to simulate a full operational flow, from job creation to final payment, including credit note application.</li>
                                <li><strong>FIX:</strong> Hardened data validation for job creation to prevent excessively large <code>finalRate</code> values, fixing a bug that could cause invoice totals to be miscalculated.</li>
                                <li><strong>ENHANCEMENT:</strong> Added new API endpoints for managing Credit Notes and generating Statements of Account to support the test workflow and application features.</li>
                                <li><strong>OPTIMIZATION:</strong> Cleaned up all backend handlers by removing unused imports and streamlining logic.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.2.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-30</p>
                    <ul>
                        <li>
                            <strong>ENHANCEMENT: Editable User Credentials</strong> - Modified the User Management system for simplicity.
                            <ul>
                                <li><strong>NEW:</strong> Usernames and passwords are now visible and editable in plain text within the "Edit User" modal.</li>
                                <li><strong>NOTE:</strong> For development and demonstration purposes, passwords are now stored in plain text in the backend database. Hashing has been removed.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.9</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-29</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Robust User Management</strong> - Implemented a full-featured and secure user management system for Super Admins.
                            <ul>
                                <li><strong>NEW:</strong> Super Admins can now edit the username and password of other admin accounts through a new "Edit" modal.</li>
                                <li><strong>SECURITY:</strong> The Super Admin account ("sadmin") is now protected and cannot be edited or deleted from the UI or API.</li>
                                <li><strong>PERSISTENCE:</strong> User data is now managed in the backend database, ensuring changes are persistent across sessions. The frontend was refactored to use a centralized state management pattern for users.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.8</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-28</p>
                    <ul>
                        <li>
                            <strong>FEATURE: User Authentication &amp; Role System</strong> - Implemented a robust user authentication and role-based access control (RBAC) system.
                            <ul>
                                <li><strong>NEW:</strong> Added a secure login page. The application is now protected and requires user authentication.</li>
                                <li><strong>NEW:</strong> Introduced two user roles: "Super Admin" and "Admin". The Super Admin has full system access, while Admins have restricted operational access.</li>
                                <li><strong>NEW:</strong> Created a "Profile" page where Super Admins can manage other admin accounts and all users can change their password.</li>
                                <li><strong>ENHANCEMENT:</strong> The UI is now role-aware. Restricted tabs like "Company Settings" are hidden from normal Admins.</li>
                                <li><strong>SECURITY:</strong> All API endpoints are now protected and require authentication. Sensitive endpoints are restricted to Super Admins.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.7</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-27</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Persistent Tab State</strong> - Refactored the tab navigation system to keep components mounted in the background. This preserves the state of forms and pages when switching between tabs. Additionally, unsaved form data in the Job Entry form is now persisted in <code>localStorage</code> to prevent data loss on browser refresh.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.6</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-26</p>
                    <ul>
                        <li>
                            <strong>REFACTOR: Hardened Invoicing &amp; Credit System</strong> - Implemented a robust server-side invoice recalculation engine. This engine now automatically applies available customer credits to new invoices, sanitizes totals, and correctly separates cash payments from applied credits for clearer financial tracking. Introduced a new API endpoint to trigger this recalculation on demand.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.5</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-25</p>
                    <ul>
                        <li>
                            <strong>UI: Standardized Input Box Styling</strong> - Updated all input boxes, text areas, and dropdowns across the application to use a consistent style (white background, black text, grey placeholder) for improved readability and a cleaner UI. This change was applied globally to ensure consistency.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.4</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-24</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Credit Notes System</strong> - Implemented a comprehensive credit notes management system within the Accounts Hub.
                            <ul>
                                <li><strong>NEW:</strong> Added a dedicated "Credit Notes" page to create, view, and track all credit notes.</li>
                                <li><strong>NEW:</strong> Credit notes can be issued on a job-specific basis (for a single invoice) or as a general account credit.</li>
                                <li><strong>NEW:</strong> The system now automatically applies available customer credits to newly generated invoices, reducing manual work and ensuring accuracy. Credits are applied in chronological (FIFO) order.</li>
                                <li><strong>ENHANCEMENT:</strong> Invoices now display payments made via credit note, providing a clear audit trail.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.3</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-23</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Backup &amp; Restore System</strong> - Added a new feature in Company Settings to allow administrators to export a full system backup (<code>.zip</code>) and import it to restore data. The backup includes all jobs, invoices, customers, drivers, and system settings.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.2</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-22</p>
                    <ul>
                        <li>
                            <strong>FIX: Assigned driver name now displays correctly</strong> - Fixed a bug where the driver's name and vehicle would not appear in the jobs table immediately after assignment. The data model was corrected to ensure UI updates are triggered reliably.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.1</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-21</p>
                    <ul>
                        <li>
                            <strong>ENHANCEMENT: Added consistent dropdown styling (grey + black)</strong> - Forced all <code>&lt;select&gt;</code> dropdown elements to follow a consistent global style (light grey background, black text) to improve UI consistency and readability.
                        </li>
                        <li>
                            <strong>ENHANCEMENT: Driver assignment now displays assigned driver in job tables for Data Entry and Management</strong> - The "Driver" column in the job tables on the Data Entry and Data Management pages now clearly displays the assigned driver's name, vehicle type, and registration (e.g., "Jane Doe (Sprinter - BV22 ABC)"), or "Unassigned" if no driver is set.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.1.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-20</p>
                    <ul>
                        <li>
                            <strong>MAJOR FEATURE: Backend Filtering &amp; Search API</strong> - Implemented comprehensive server-side filtering and searching capabilities for Jobs and Invoices.
                            <ul>
                                <li><strong>NEW:</strong> The Jobs API (<code>/jobs/</code>) now supports filtering by a combined search term (Company, AWB, Ref), date range, main source, and customer.</li>
                                <li><strong>NEW:</strong> The Invoices API (<code>/invoices/</code>) now supports filtering by a multi-mode search term (Invoice #, AWB #, Customer) and date range.</li>
                                <li><strong>REFACTOR:</strong> Aligned backend schemas (<code>Job</code>, <code>JobCreate</code>) with the frontend data model, ensuring all fields from the job creation form are correctly processed and stored. This improves data integrity and prepares the system for full frontend-backend integration.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.9</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-19</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Advanced Invoice Filtering</strong> - Implemented a comprehensive search and filter toolbar on the Invoicing page.
                            <ul>
                                <li><strong>NEW:</strong> Users can now search invoices by Invoice Number, AWB Number, or Customer Name.</li>
                                <li><strong>NEW:</strong> Added a date range filter (From/To) to narrow down invoices by their creation date.</li>
                                <li><strong>ENHANCEMENT:</strong> All filters work in combination and update the invoice list dynamically for an improved user experience.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.8</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-18</p>
                    <ul>
                        <li>
                            <strong>REFACTOR: Data Model Alignment</strong> - Aligned the frontend Invoice data model with the backend schema. Changed Invoice ID from <code>string</code> to <code>number</code> and added a human-readable <code>invoice_ref</code>. This change prepares the application for future API integration and improves data consistency.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.7</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-17</p>
                    <ul>
                        <li>
                            <strong>REFACTOR: Data Model Alignment</strong> - Refactored frontend data models to use numeric IDs for Jobs, Customers, and Drivers, ensuring alignment with backend database schemas and improving future-proofing for API integration.
                        </li>
                        <li>
                            <strong>FIX: UI Consistency</strong> - Enforced the default application text color to be pure black (<code>#000000</code>) to comply with design standards and improve readability.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.6</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-16</p>
                    <ul>
                        <li>
                            <strong>FIX: Permanent Invoice Text &amp; Layout Fix</strong> - Enforced black (<code>#000000</code>) text on all invoice elements, including headers, line items, and totals, to guarantee readability in both the UI and PDF exports regardless of branding colors.
                        </li>
                        <li>
                            <strong>ENHANCEMENT:</strong> Improved invoice layout consistency with standardized font weights and clear borders for a more professional appearance.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.5</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-15</p>
                    <ul>
                        <li>
                            <strong>FIX: Permanent Global Text Readability Fix</strong> - Enforced black (<code>#000000</code>) text color across all printable documents (Invoices, Statements of Account) and a default very dark gray (<code>#111827</code>) for all UI text. This change guarantees maximum readability and contrast by overriding theme and branding colors for text elements, resolving any issues with light-colored text on light backgrounds.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.4</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-14</p>
                    <ul>
                        <li>
                            <strong>REFACTOR: Backend Schema &amp; Logic Refinement</strong> - Refactored the backend schemas for improved type safety and data consistency.
                             <ul>
                                <li><strong>FIX:</strong> Corrected the invoice creation logic by introducing a dedicated <code>InvoiceCreate</code> schema, preventing potential data validation errors.</li>
                                <li><strong>ENHANCEMENT:</strong> Synchronized the <code>Job</code> data model with the frontend by including nested invoice information in API responses. This ensures the UI has access to all necessary data without extra requests.</li>
                                <li><strong>PERFORMANCE:</strong> Optimized database queries by eager-loading related job and invoice data, reducing the number of queries needed to fetch complete datasets.</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.3</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-13</p>
                    <ul>
                        <li>
                            <strong>STABILITY: Permanent Backend Fixes</strong> - Applied permanent stability fixes to the backend. This includes standardizing the package structure with correct <code>__init__</code> files and relative imports, ensuring robust date handling in the seed script, and correcting dependency management to guarantee the backend runs reliably out-of-the-box as per the documentation.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.2</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-12</p>
                    <ul>
                        <li>
                            <strong>FIX: Enforced Black Invoice Text</strong> - Fixed a critical readability bug in PDF exports. All text within the invoice is now enforced to render as solid black (<code>#000000</code>) to guarantee visibility against the white A4 background, regardless of branding color settings.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.1</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-11</p>
                    <ul>
                        <li>
                            <strong>FIX: Critical Invoice Text Readability</strong> - Fixed a major bug where invoice text could become invisible against the white page background. All text within the invoice is now enforced to be a dark, legible color, ensuring perfect readability in the UI and in PDF exports.
                        </li>
                        <li>
                            <strong>ENHANCEMENT:</strong> Branding accent colors are now correctly restricted to non-text elements like background highlights and borders, preventing color clashes that obscure important financial data.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 4.0.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-10</p>
                    <ul>
                        <li>
                            <strong>MAJOR FEATURE: Full Backend Implementation</strong> - Implemented a complete backend using Python, FastAPI, and SQLAlchemy. The backend is decoupled and runs locally, serving data via a REST API.
                            <ul>
                                <li><strong>NEW:</strong> Created full CRUD API endpoints for Jobs, Customers, Drivers, Invoices, and Payments.</li>
                                <li><strong>NEW:</strong> Implemented business logic for automatic invoice generation when a job is marked "Completed".</li>
                                <li><strong>NEW:</strong> Added a SQLite database (`sql_app.db`) for data persistence.</li>
                                <li><strong>NEW:</strong> Provided a data seeding script (`seed_data.py`) to populate the database with realistic test data.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>DOCS:</strong> Overhauled `README.md` with a "Critical Stability Rules" section, detailed backend setup instructions (including `.txt` to `.py` file conversion), and an updated workflow description.
                        </li>
                        <li>
                            <strong>DOCS:</strong> Added a new `backend/README_backend.txt` with specific, step-by-step instructions for Windows users.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.9.2</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-09</p>
                    <ul>
                        <li>
                            <strong>FIX: Guaranteed Invoice Text Readability</strong> - Forced all text within the invoice body to a dark color, resolving a critical bug where text (such as headers) could become invisible if a light accent color was selected by the user. This ensures all invoices are always readable.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.9.1</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-08</p>
                    <ul>
                        <li>
                            <strong>FIX: Invoice Text Readability</strong> - Resolved an issue where invoice text could become unreadable. The "Balance Due" row now dynamically adjusts its text color (to black or white) to ensure high contrast against the user-selected accent color, fixing cases where white text appeared on a light-colored background.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.9.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-07</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Strict A4 Invoice Layout</strong> - Rebuilt the invoice page to use a strict A4 page format (210mm x 297mm), ensuring a professional and consistent appearance when printed or exported to PDF.
                        </li>
                        <li>
                            <strong>FEATURE: Complete Job Data Binding</strong> - Invoices now automatically bind and display all critical job details, including a detailed description with pickup/delivery locations, AWB/Ref, pieces, weight, and pricing in a new structured line-items table.
                        </li>
                        <li>
                            <strong>ENHANCEMENT: A4-Safe Invoice Editor</strong> - The visual invoice editor now operates within the A4 constraints, allowing for safe customization of branding elements without breaking the print-friendly layout.
                        </li>
                        <li>
                            <strong>DOCS:</strong> Updated `README.md` to reflect the new A4 layout and automatic data binding process.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.8.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-06</p>
                    <ul>
                        <li>
                            <strong>MAJOR FEATURE: WYSIWYG Invoice Editor</strong> - Replaced the previous invoice editor with a powerful, visual "What You See Is What You Get" editor.
                            <ul>
                                <li><strong>NEW:</strong> Users can now manage multiple invoice templates, create new ones, and reset them to a default professional design.</li>
                                <li><strong>NEW:</strong> The editor allows reordering of invoice sections (Header, Totals, etc.) and provides UI controls to adjust styles like logo size, font size, and accent color with a live preview.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>FEATURE: Modernized Invoice Design</strong>
                            <ul>
                                <li><strong>ENHANCEMENT:</strong> The invoice document has been completely rebuilt with a cleaner, more professional layout that enhances readability.</li>
                                <li><strong>ENHANCEMENT:</strong> The invoice now dynamically renders its layout and styles based on the active template selected in the new editor.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>DOCS:</strong> Updated `README.md` with detailed instructions for using the new visual invoice editor and managing templates.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.7.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-05</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Company Branding & Settings</strong> - Introduced a new "Company Settings" hub.
                            <ul>
                                <li><strong>NEW:</strong> Added a "Branding" tab to manage company logo, address, contact, and bank details. This data is now applied globally.</li>
                                <li><strong>NEW:</strong> Added a UI-based "Invoice Template" editor to allow non-technical users to customize invoice layouts, toggle fields, and edit labels with a live preview.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>FEATURE: Rebuilt Invoice Page</strong>
                            <ul>
                                <li><strong>NEW:</strong> The invoice viewing page has been completely redesigned with a modern, professional layout.</li>
                                <li><strong>ENHANCEMENT:</strong> Invoices now automatically render the centrally-managed company branding and user-defined template customizations.</li>
                                <li><strong>STABILITY:</strong> The new invoice page is built with defensive rendering to prevent blank page crashes, even with incomplete data.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>DOCS:</strong> Updated `README.md` with instructions for the new branding and invoice editing features.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.6.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-04</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Logo & Branding Integration</strong> - Replaced the placeholder logo with the official company SVG logo.
                        </li>
                        <li>
                            <strong>ENHANCEMENT:</strong> The new logo is now consistently displayed across the application, including the main header, dashboard, and on all printable invoice views, for unified branding.
                        </li>
                        <li>
                            <strong>COMPONENT:</strong> Updated the central `&lt;CompanyLogoIcon /&gt;` component to render the new logo, ensuring brand consistency.
                        </li>
                         <li>
                            <strong>DOCS:</strong> Updated `README.md` with instructions on how to manage and update the company logo in the future.
                        </li>
                    </ul>
                </section>
                 <section>
                    <h2>Version 3.5.4</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-03</p>
                    <ul>
                        <li>
                            <strong>STABILITY: Robust Date Calculation</strong> - Enhanced system stability by implementing a robust utility function (`parsePaymentTermDays`) for calculating invoice due dates from customer payment terms. This prevents date-related crashes from unexpected or malformed payment term data.
                        </li>
                        <li>
                            <strong>STABILITY: Global Error Catching</strong> - Implemented global `window.onerror` and `window.onunhandledrejection` handlers to catch any JavaScript errors that occur outside of the React component tree. This provides a final layer of protection against blank screen errors and improves error logging.
                        </li>
                        <li>
                            <strong>DOCS:</strong> Added a permanent "Critical Stability Rules" section to the `README.md` to enforce best practices for all future development.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.5.3</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-02</p>
                    <ul>
                        <li>
                            <strong>STABILITY: Permanent "Invalid time value" Fix</strong> - Implemented a permanent solution for crashes caused by invalid dates during invoice creation.
                        </li>
                        <li>
                            <strong>FIX:</strong> The logic for calculating an invoice's due date is now robust and correctly handles all customer payment term formats, including "On Receipt", preventing the creation of invalid dates. This fix was applied to both the live application logic (`App.tsx`) and the mock data generation script (`large-mock-data.ts`) to ensure app stability.
                        </li>
                        <li>
                            <strong>ENHANCEMENT:</strong> Hardened the mock data generation script by adding extra validation to ensure job dates are valid before an invoice is created.
                        </li>
                    </ul>
                </section>
                 <section>
                    <h2>Version 3.5.2</h2>
                    <p className="text-sm text-gray-500">Released: 2024-06-01</p>
                    <ul>
                        <li>
                            <strong>STABILITY: Permanent Blank Page Fix</strong> - Implemented a permanent solution to prevent blank page crashes caused by rendering components with incomplete data.
                        </li>
                        <li>
                            <strong>FIX:</strong> Corrected a data flow bug where the "Edit Job" form on the Accounts page was not receiving the full customer list, which could lead to data corruption on save.
                        </li>
                        <li>
                            <strong>ENHANCEMENT:</strong> Added defensive guards (optional chaining) to all components that render invoice data (`InvoicesTable`, `PaymentModal`, `StatementOfAccountsPage`). These components will now safely render fallback text instead of crashing if an invoice object is missing details, making the UI much more robust.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.5.1</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-31</p>
                    <ul>
                        <li>
                            <strong>FIX:</strong> Resolved a "RangeError: Invalid time value" crash by implementing a `safeParseDate` utility.
                        </li>
                        <li>
                            <strong>STABILITY:</strong> Refactored all date comparisons and sorting logic (`App.tsx`, `StatementOfAccountsPage.tsx`) to use the new safe date parsing utility, preventing crashes from malformed date strings in the data.
                        </li>
                        <li>
                            <strong>ENHANCEMENT:</strong> Improved date filtering logic in "Statement of Accounts" to correctly include the entire day for the selected end date.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.5.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-30</p>
                    <ul>
                        <li>
                            <strong>STABILITY: Permanent Crash Protection</strong>
                            <ul>
                                <li><strong>NEW:</strong> Added a `safeDateFormat` utility to handle all date rendering. This prevents the application from crashing due to `null`, `undefined`, or invalid date strings by providing a safe fallback.</li>
                                <li><strong>ENHANCEMENT:</strong> Moved the `ErrorBoundary` to the top level of the application (`index.tsx`) to act as a global catch-all. This ensures that any unexpected rendering error will display a user-friendly message instead of a blank white page.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>REFACTOR:</strong> Updated all components that display dates (`JobsTable`, `InvoicesTable`, `InvoiceDetailPage`, etc.) to use the new `safeDateFormat` utility for improved robustness.
                        </li>
                         <li>
                            <strong>DOCS:</strong> Updated `README.md` and Version History to reflect the new stability enhancements.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.4.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-29</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Singular Invoice Generation</strong>
                            <ul>
                                <li><strong>NEW:</strong> Added a "View" button to the Invoicing table to open a detailed, singular invoice page that is styled for printing and PDF export.</li>
                                <li><strong>NEW:</strong> The invoice page dynamically includes all relevant company, customer, and job details, along with a full financial breakdown (Subtotal, VAT, Total).</li>
                            </ul>
                        </li>
                        <li>
                            <strong>FEATURE: Customer Database Enhancements</strong>
                             <ul>
                                <li><strong>NEW:</strong> Expanded the customer data schema to include full address, contact details (phone, email), an account reference code, and payment terms.</li>
                                <li><strong>ENHANCEMENT:</strong> The invoice generation process now automatically pulls the customer's full, up-to-date details to populate the invoice.</li>
                                <li><strong>DATA:</strong> Updated the mock customer dataset with more realistic, detailed company profiles.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>UI/UX: Unified Branding & Logo</strong>
                             <ul>
                                <li><strong>NEW:</strong> Created a hard-coded company logo and integrated it throughout the application, including the main header, dashboard, and invoice templates, for consistent branding.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>DOCS:</strong> Updated `README.md` and Version History to reflect all new invoicing and branding features.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.3.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-28</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Pagination</strong> - Implemented client-side pagination for all major data tables (Jobs, Invoices, Customers, Drivers) to significantly improve performance and usability with large datasets. Users can now control page size (50, 100, 150, 200, All) and navigate through pages.
                        </li>
                        <li>
                            <strong>FEATURE: Statement of Accounts (SAO)</strong>
                             <ul>
                                <li><strong>NEW:</strong> Added a new "Statement of Accounts" page.</li>
                                <li><strong>NEW:</strong> Users can filter invoices by customer and date range to generate a statement.</li>
                                <li><strong>NEW:</strong> Added a print-friendly PDF export option for the generated statement.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>UI/UX: Accounts Section Redesign</strong>
                             <ul>
                                <li><strong>NEW:</strong> Introduced a new "Accounts Hub" landing page, providing clear navigation to either "Invoicing" or the new "Statement of Accounts" feature.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>STABILITY: Blank Page Prevention</strong>
                             <ul>
                                <li><strong>NEW:</strong> Implemented a global Error Boundary. The app will now show a user-friendly error page instead of crashing to a blank screen, improving overall robustness.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>DOCS:</strong> Updated `README.md` and Version History to reflect all new features and the updated application workflow.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.2.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-27</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Large Mock Dataset</strong> - Added a large, realistic mock dataset with hundreds of jobs and invoices to allow for realistic testing of bulk operations, filtering, and performance.
                        </li>
                        <li>
                            <strong>FEATURE: System Statistics Page</strong>
                             <ul>
                                <li><strong>NEW:</strong> Introduced a new "System Statistics" page, accessible from the start page dashboard.</li>
                                <li><strong>NEW:</strong> The page displays key system-wide metrics, including counts for jobs, clients, and invoices (by status), as well as financial summaries like total billed vs. total paid.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>DOCS:</strong> Added a new "System Limits & Performance Considerations" section to the `README.md`. This provides a detailed analysis of the current architecture's theoretical limits and offers a clear, actionable roadmap for future scaling.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.1.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-26</p>
                    <ul>
                        <li>
                            <strong>FEATURE: Accounts Page Enhancements</strong>
                            <ul>
                                <li><strong>Job Editing:</strong> Accountants can now edit job details directly from the Accounts page. Changes to a job's financial details automatically sync with the linked invoice.</li>
                                <li><strong>Bulk Invoice Payments:</strong> Users can now select multiple invoices and apply a single payment. The system supports "Mark as Fully Paid" and "Apply Partial Payment" options.</li>
                                <li><strong>FIFO Payment Logic:</strong> Partial bulk payments are intelligently applied to the oldest selected invoices first (First-In, First-Out).</li>
                            </ul>
                        </li>
                        <li>
                            <strong>FEATURE: Payment Workflow</strong> - Added a "Payment Date" field to the payment modal, allowing for accurate record-keeping.
                        </li>
                         <li>
                            <strong>UI/UX:</strong> Fixed the "Add Payment" modal UI to use the standard white/grey theme with dark text for consistency and readability.
                        </li>
                         <li>
                            <strong>BACKEND:</strong> Updated the backend API to support all new features, including a new endpoint for bulk payments and enhanced logic for job/invoice data synchronization.
                        </li>
                         <li>
                            <strong>DOCS:</strong> Updated `README.md` and Version History page with details of the new accounting workflows.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 3.0.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-25</p>
                    <ul>
                        <li>
                            <strong>MAJOR ARCHITECTURE: Backend Implementation</strong> - Created a new `/backend` directory containing a complete, standalone backend application.
                        </li>
                        <li>
                            <strong>NEW:</strong> Built the backend using Python with FastAPI, SQLAlchemy (ORM), and Pydantic for data validation.
                        </li>
                         <li>
                            <strong>NEW:</strong> Implemented a SQLite database (`sql_app.db`) for data persistence.
                        </li>
                        <li>
                            <strong>NEW:</strong> Added comprehensive API endpoints for managing Jobs (CRUD, assign driver, mark complete), Invoices (list, view), and Payments (record payment).
                        </li>
                         <li>
                            <strong>NEW:</strong> Added interactive API documentation via Swagger UI, available at `/docs` when the server is running.
                        </li>
                        <li>
                            <strong>DOCS:</strong> Overhauled `README.md` with backend setup instructions, and a prompt for future frontend integration.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 2.0.2</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-24</p>
                    <ul>
                        <li>
                            <strong>FIX:</strong> Forced all text on the Version History page to be dark for better visibility.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 2.0.1</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-23</p>
                    <ul>
                        <li>
                            <strong>FIX:</strong> Corrected a visual bug on the Version History page where changelog text was not visible. The text color is now dark for improved readability.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 2.0.0</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-22</p>
                    <ul>
                        <li>
                            <strong>MAJOR FEATURE: Invoicing System</strong> - Introduced a full invoicing workflow.
                        </li>
                        <li>
                            <strong>NEW: Automated Invoice Generation</strong> - Jobs marked as "Completed" now automatically create a new, "Unpaid" invoice in the Accounts section.
                        </li>
                        <li>
                            <strong>NEW: Accounts Page Overhaul</strong> - The Accounts page is now a fully functional invoice management dashboard with status filters (Unpaid, Partially Paid, Paid).
                        </li>
                        <li>
                           <strong>NEW: Payment Tracking</strong> - Added functionality to record full or partial payments against invoices. The system automatically calculates the outstanding balance and updates the invoice status.
                        </li>
                         <li>
                           <strong>NEW: PDF Export Placeholder</strong> - Added a disabled "Export PDF" button to the invoices table for future implementation.
                        </li>
                        <li>
                            <strong>ENHANCEMENT:</strong> Updated UI icons and improved data flow for the new invoicing feature.
                        </li>
                        <li>
                            <strong>DOCS:</strong> Updated `README.md` and Version History page with details of the 2.0.0 release.
                        </li>
                    </ul>
                </section>
                <section>
                    <h2>Version 1.2.2</h2>
                    <p className="text-sm text-gray-500">Released: 2024-05-21</p>
                    <ul>
                        <li>
                            <strong>NEW:</strong> Added application versioning system (`1.2.2`).
                        </li>
                        <li>
                            <strong>NEW:</strong> Implemented a version number display in the application UI footer.
                        </li>
                        <li>
                            <strong>NEW:</strong> Added a version history easter egg: Triple-clicking the user profile picture now plays an animation and opens a version information modal.
                        </li>
                        <li>
                            <strong>NEW:</strong> Created this "Version History" page, accessible from the version modal, which displays a detailed changelog of updates.
                        </li>
                        <li>
                            <strong>NEW:</strong> Created a `README.md` file to document the project architecture, versioning strategy, and changelog for developers and AI assistants.
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    );
};

export default VersionHistoryPage;
