'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import icons
import { Database as DatabaseIcon, Settings as SettingsIcon, User as UserIcon, Code as CodeIcon } from 'lucide-react';

interface InstallFormData {
  // Database
  useConnectionString: boolean;
  connectionString: string;
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  useSSL: boolean;

  // System
  nextAuthUrl: string;
  storageDriver: 'local' | 's3' | 'r2';
  uploadDir: string;
  sandboxMemoryLimit: string;
  sandboxTimeout: string;

  // S3/R2 Config
  s3Endpoint: string;
  s3AccessKeyId: string;
  s3SecretAccessKey: string;
  s3Bucket: string;
  s3PublicUrl: string;

  // Admin
  adminEmail: string;
  adminPassword: string;
  adminConfirmPassword: string;
  adminRoleName: string;
}

export default function InstallPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [installed, setInstalled] = useState(false);

  const router = useRouter();

  const [formData, setFormData] = useState<InstallFormData>({
    // Database
    useConnectionString: false,
    connectionString: '',
    dbHost: 'localhost',
    dbPort: '5432',
    dbName: 'blacklotuscms',
    dbUser: 'postgres',
    dbPassword: '',
    useSSL: false,

    // System
    nextAuthUrl: 'http://localhost:3000',
    storageDriver: 'local',
    uploadDir: '/app/uploads',
    sandboxMemoryLimit: '512',
    sandboxTimeout: '30',

    // S3/R2 Config
    s3Endpoint: '',
    s3AccessKeyId: '',
    s3SecretAccessKey: '',
    s3Bucket: '',
    s3PublicUrl: '',

    // Admin
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: '',
    adminRoleName: 'Administrador',
  });

  useEffect(() => {
    checkInstallationStatus();
  }, []);

  const checkInstallationStatus = async () => {
    try {
      const response = await fetch('/api/install');
      const data = await response.json();

      if (data.installed) {
        setInstalled(true);
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error checking installation status:', error);
    }
  };

  const handleInputChange = (field: keyof InstallFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Erro ao enviar dados. Tente novamente.');
      console.error('Installation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Banco', icon: DatabaseIcon },
    { id: 2, title: 'Sistema', icon: SettingsIcon },
    { id: 3, title: 'Admin', icon: UserIcon },
  ];

  if (installed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-12 text-center max-w-md w-full">
          <h1 className="headline-lg text-primary mb-4 normal-case">
            Sistema Instalado
          </h1>
          <p className="body-md text-on-surface-variant">
            Redirecionando para a área administrativa...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8 flex flex-col items-center gap-4">
          <img src="/assets/brand/logo.png" alt="BlackLotusCMS" className="w-24 h-24 object-contain drop-shadow-2xl mb-2" />
          <div>
            <span className="label-caps text-primary mb-2 block tracking-[0.2em] normal-case">Couture Content Management</span>
            <h1 className="headline-lg text-on-background uppercase">BlackLotusCMS</h1>
            <p className="body-md text-on-surface-variant mt-2 italic">Meticulous setup for an exclusive digital environment.</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav className="flex justify-center">
            <ol className="flex items-center space-x-6 sm:space-x-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCurrent = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <li key={step.id} className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-11 h-11 rounded-sm transition-all duration-500 ${isCurrent
                        ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(242,202,80,0.3)]'
                        : isCompleted
                          ? 'bg-surface-container-highest text-primary'
                          : 'bg-surface-container text-on-surface-variant/30'
                        }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-3 label-caps text-[11px] normal-case ${isCurrent
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-on-surface'
                          : 'text-on-surface-variant/30'
                        }`}
                    >
                      {step.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          
          {error && (
            <div className="bg-error/10 border-l-4 border-error text-error p-4 mb-6 label-caps text-xs normal-case">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-primary/10 border-l-4 border-primary text-primary p-4 mb-6 label-caps text-xs normal-case">
              {success}
            </div>
          )}

          {/* Step 1: Database Configuration */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="headline-md text-on-background text-xl normal-case">
                Database Configuration
              </h2>
              
              <div className="flex bg-surface-container-lowest p-1 rounded-sm border border-white/5">
                <button
                  type="button"
                  className={`flex-1 py-2 label-caps text-[11px] normal-case transition-all ${!formData.useConnectionString ? 'bg-surface-container-highest text-primary' : 'text-on-surface-variant/50 hover:text-on-surface'}`}
                  onClick={() => handleInputChange('useConnectionString', false)}
                >
                  Fragmented
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 label-caps text-[11px] normal-case transition-all ${formData.useConnectionString ? 'bg-surface-container-highest text-primary' : 'text-on-surface-variant/50 hover:text-on-surface'}`}
                  onClick={() => handleInputChange('useConnectionString', true)}
                >
                  Direct String
                </button>
              </div>

              {formData.useConnectionString ? (
                <div className="space-y-6">
                  <div className="flex flex-col">
                    <label htmlFor="connectionString" className="label-caps text-[11px] normal-case text-on-surface-variant mb-2">
                      Connection String (PostgreSQL URI)
                    </label>
                    <textarea
                      id="connectionString"
                      required
                      rows={3}
                      className="bg-surface-container-low border-b border-outline-variant py-3 px-4 focus:border-primary outline-none transition-all font-mono text-sm text-on-background"
                      placeholder="postgresql://user:password@host:port/dbname"
                      value={formData.connectionString}
                      onChange={(e) => handleInputChange('connectionString', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                  {[
                    { id: 'dbHost', label: 'Host', type: 'text' },
                    { id: 'dbPort', label: 'Port', type: 'number' },
                    { id: 'dbName', label: 'Database Name', type: 'text' },
                    { id: 'dbUser', label: 'User', type: 'text' },
                    { id: 'dbPassword', label: 'Password', type: 'password' },
                  ].map((field) => (
                    <div key={field.id} className="flex flex-col">
                      <label htmlFor={field.id} className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                        {field.label}
                      </label>
                      <input
                        id={field.id}
                        type={field.type}
                        required
                        className="bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none transition-colors label-caps text-[12px] normal-case text-on-background"
                        value={(formData as any)[field.id]}
                        onChange={(e) => handleInputChange(field.id as any, e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  ))}

                  <div className="flex items-center pt-4">
                    <input
                      id="useSSL"
                      type="checkbox"
                      className="h-4 w-4 border-outline bg-transparent text-primary focus:ring-primary rounded-sm"
                      checked={formData.useSSL}
                      onChange={(e) => handleInputChange('useSSL', e.target.checked)}
                      disabled={loading}
                    />
                    <label htmlFor="useSSL" className="ml-3 label-caps text-[11px] normal-case text-on-surface-variant">
                      Use SSL
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: System Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="headline-md text-on-background text-xl normal-case">
                System Core
              </h2>

              <div className="flex flex-col">
                <label htmlFor="nextAuthUrl" className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                  System URL (Production)
                </label>
                <input
                  id="nextAuthUrl"
                  type="url"
                  required
                  className="bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none transition-colors label-caps text-[12px] normal-case text-on-background"
                  value={formData.nextAuthUrl}
                  onChange={(e) => handleInputChange('nextAuthUrl', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                <div className="flex flex-col">
                  <label htmlFor="storageDriver" className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                    Storage Driver
                  </label>
                  <select
                    id="storageDriver"
                    required
                    className="select-minimal text-[11px] normal-case"
                    value={formData.storageDriver}
                    onChange={(e) => handleInputChange('storageDriver', e.target.value as 'local' | 's3' | 'r2')}
                    disabled={loading}
                  >
                    <option value="local">Local Filesystem</option>
                    <option value="s3">Amazon S3 Cloud</option>
                    <option value="r2">Cloudflare R2</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="uploadDir" className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                    Upload Directory
                  </label>
                  <input
                    id="uploadDir"
                    type="text"
                    required
                    className="bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none transition-colors label-caps text-[12px] normal-case text-on-background"
                    value={formData.uploadDir}
                    onChange={(e) => handleInputChange('uploadDir', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {formData.storageDriver !== 'local' && (
                <div className="animate-in slide-in-from-top-4 duration-500 space-y-6 pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    <h3 className="label-caps text-[10px] normal-case text-primary tracking-widest">
                      {formData.storageDriver.toUpperCase()} Configuration
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                    <div className="flex flex-col">
                      <label htmlFor="s3Endpoint" className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                        Endpoint URI
                      </label>
                      <input
                        id="s3Endpoint"
                        type="text"
                        required
                        className="bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none transition-colors label-caps text-[12px] normal-case text-on-background"
                        placeholder={formData.storageDriver === 'r2' ? 'https://<id>.r2.cloudflarestorage.com' : 'https://s3.amazonaws.com'}
                        value={formData.s3Endpoint}
                        onChange={(e) => handleInputChange('s3Endpoint', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="s3Bucket" className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                        Bucket Name
                      </label>
                      <input
                        id="s3Bucket"
                        type="text"
                        required
                        className="bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none transition-colors label-caps text-[12px] normal-case text-on-background"
                        value={formData.s3Bucket}
                        onChange={(e) => handleInputChange('s3Bucket', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="s3AccessKeyId" className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                        Access Key Id
                      </label>
                      <input
                        id="s3AccessKeyId"
                        type="password"
                        required
                        className="bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none transition-colors label-caps text-[12px] normal-case text-on-background"
                        value={formData.s3AccessKeyId}
                        onChange={(e) => handleInputChange('s3AccessKeyId', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="s3SecretAccessKey" className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                        Secret Access Key
                      </label>
                      <input
                        id="s3SecretAccessKey"
                        type="password"
                        required
                        className="bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none transition-colors label-caps text-[12px] normal-case text-on-background"
                        value={formData.s3SecretAccessKey}
                        onChange={(e) => handleInputChange('s3SecretAccessKey', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-col sm:col-span-2">
                      <label htmlFor="s3PublicUrl" className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                        Public Delivery URL (CDN)
                      </label>
                      <input
                        id="s3PublicUrl"
                        type="url"
                        className="bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none transition-colors label-caps text-[12px] normal-case text-on-background"
                        placeholder="https://pub-xyz.r2.dev"
                        value={formData.s3PublicUrl}
                        onChange={(e) => handleInputChange('s3PublicUrl', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Admin Account */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="headline-md text-on-background text-xl normal-case">
                Administrator Account
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                {[
                  { id: 'adminEmail', label: 'Email Address', type: 'email' },
                  { id: 'adminRoleName', label: 'Profile Name', type: 'text' },
                  { id: 'adminPassword', label: 'Password', type: 'password' },
                  { id: 'adminConfirmPassword', label: 'Confirm Password', type: 'password' },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col">
                    <label htmlFor={field.id} className="label-caps text-[11px] normal-case text-on-surface-variant mb-1">
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      type={field.type}
                      required
                      minLength={6}
                      className="bg-transparent border-b border-outline-variant py-2 focus:border-primary outline-none transition-colors label-caps text-[12px] normal-case text-on-background"
                      value={(formData as any)[field.id]}
                      onChange={(e) => handleInputChange(field.id as any, e.target.value)}
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex justify-between items-center">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-ghost py-2 px-6 text-[11px] label-caps normal-case"
                disabled={loading}
              >
                Back
              </button>
            ) : <div />}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary py-2 px-8 text-[11px] label-caps normal-case shadow-lg"
                disabled={loading}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary py-2 px-10 text-[11px] label-caps normal-case shadow-lg"
                disabled={loading}
              >
                {loading ? 'Deploying...' : 'Finalize Setup'}
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="label-caps text-[10px] normal-case text-on-surface-variant/40">
            BlackLotusCMS — V1.0.0 — © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
