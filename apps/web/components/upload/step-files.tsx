'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, Image, Video, Music, FileText, Box } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useUploadStore } from '@/stores/upload-store';
import { cn } from '@/lib/utils';
import { FILE_LIMITS, ASSET_TYPES } from '@assetbox/config';

const bytesToSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

const assetTypeIcons:  Record<string, any> = {
  IMAGE: Image,
  VIDEO: Video,
  AUDIO: Music,
  TEXT:  FileText,
  TWO_D: Image,
  THREE_D: Box,
};

export function StepFiles() {
  const { files, assetType, setFiles, setDetails, nextStep } = useUploadStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles([...files, ...acceptedFiles]);
    },
    [files, setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple:  true,
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const detectAssetType = (file: File): string => {
    const mimeType = file. type;

    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType. startsWith('audio/')) return 'AUDIO';
    if (mimeType. includes('pdf') || mimeType. includes('text')) return 'TEXT';

    // Check by extension
    const ext = file.name. split('.').pop()?.toLowerCase();
    if (['glb', 'gltf', 'fbx', 'obj', 'blend'].includes(ext || '')) return 'THREE_D';
    if (['psd', 'ai', 'eps', 'svg'].includes(ext || '')) return 'TWO_D';

    return 'IMAGE';
  };

  const handleContinue = () => {
    if (files.length > 0 && ! assetType) {
      // Auto-detect asset type from first file
      const detected = detectAssetType(files[0]);
      setDetails({ assetType: detected as any });
    }
    nextStep();
  };

  const totalSize = files.reduce((sum, file) => sum + file. size, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Upload Your Files</h2>
        <p className="mt-1 text-muted-foreground">
          Drag and drop your files or click to browse.  You can upload multiple files. 
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-center font-medium">
          {isDragActive ?  'Drop files here.. .' : 'Drag & drop files here'}
        </p>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          or click to browse
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Supported: Images, Videos, Audio, Documents, 3D Models
          <br />
          Max 500MB per file
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </h3>
            <span className="text-sm text-muted-foreground">
              Total:  {bytesToSize(totalSize)}
            </span>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => {
              const type = detectAssetType(file);
              const Icon = assetTypeIcons[type] || FileIcon;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-background">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {bytesToSize(file. size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={files.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}