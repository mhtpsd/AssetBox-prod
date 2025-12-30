import { create } from 'zustand';

type AssetType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT' | 'TWO_D' | 'THREE_D';
type LicenseType = 'STANDARD' | 'COMMERCIAL' | 'EXTENDED';
type ProofType = 'FILE' | 'TEXT' | 'LINK';

interface UploadState {
  // Wizard step
  step:  number;

  // Step 1: Files
  files: File[];

  // Step 2: Details
  title: string;
  description: string;
  assetType: AssetType | null;
  category: string;
  subcategory:  string;
  tags: string[];

  // Step 3: Pricing
  price: number;
  licenseType: LicenseType;

  // Step 4: Proof
  proofType: ProofType;
  proofData: string;
  proofFile: File | null;

  // Status
  isUploading: boolean;
  uploadProgress:  number;
  uploadError: string | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setFiles:  (files: File[]) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  setDetails: (details:  Partial<UploadState>) => void;
  setPricing: (pricing: { price: number; licenseType: LicenseType }) => void;
  setProof: (proof:  { type: ProofType; data: string; file?:  File }) => void;
  setUploadProgress: (progress:  number) => void;
  setUploadError: (error:  string | null) => void;
  setIsUploading:  (isUploading: boolean) => void;
  reset: () => void;
}

const initialState = {
  step:  1,
  files:  [],
  title:  '',
  description:  '',
  assetType: null as AssetType | null,
  category:  '',
  subcategory: '',
  tags: [],
  price: 0,
  licenseType: 'STANDARD' as LicenseType,
  proofType: 'TEXT' as ProofType,
  proofData: '',
  proofFile: null as File | null,
  isUploading: false,
  uploadProgress: 0,
  uploadError: null as string | null,
};

export const useUploadStore = create<UploadState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  nextStep: () => set((state) => ({ step: Math.min(state. step + 1, 5) })),

  prevStep: () => set((state) => ({ step: Math. max(state.step - 1, 1) })),

  setFiles: (files) => set({ files }),

  addFiles: (newFiles) =>
    set((state) => ({
      files: [... state.files, ... newFiles],
    })),

  removeFile: (index) =>
    set((state) => ({
      files: state. files.filter((_, i) => i !== index),
    })),

  setDetails: (details) => set(details),

  setPricing: ({ price, licenseType }) => set({ price, licenseType }),

  setProof: ({ type, data, file }) =>
    set({
      proofType: type,
      proofData: data,
      proofFile: file || null,
    }),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  setUploadError:  (error) => set({ uploadError: error }),

  setIsUploading: (isUploading) => set({ isUploading }),

  reset: () => set(initialState),
}));