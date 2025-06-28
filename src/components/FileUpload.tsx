
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, File, FileText, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  label: string;
  description?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onFilesChange, 
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  label,
  description
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `property-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('property-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const remainingSlots = maxFiles - files.length;
    if (selectedFiles.length > remainingSlots) {
      toast({
        title: "Limite atteinte",
        description: `Vous ne pouvez ajouter que ${remainingSlots} fichier(s) supplémentaire(s)`,
        variant: "destructive"
      });
      return;
    }

    const newFiles: string[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 10MB par fichier",
          variant: "destructive"
        });
        continue;
      }

      const fileUrl = await uploadFile(file);
      if (fileUrl) {
        newFiles.push(fileUrl);
      }
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
      toast({
        title: "Succès",
        description: `${newFiles.length} fichier(s) téléchargé(s) avec succès`
      });
    }

    // Reset input
    event.target.value = '';
  };

  const removeFile = async (indexToRemove: number) => {
    const fileUrl = files[indexToRemove];
    
    // Extraire le chemin du fichier de l'URL
    try {
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split('/');
      const fileName = pathSegments[pathSegments.length - 1];
      const filePath = `property-files/${fileName}`;

      // Supprimer de Supabase Storage
      await supabase.storage
        .from('property-files')
        .remove([filePath]);
    } catch (error) {
      console.error('Error removing file from storage:', error);
    }

    // Supprimer de la liste locale
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    onFilesChange(newFiles);
    
    toast({
      title: "Fichier supprimé",
      description: "Le fichier a été supprimé avec succès"
    });
  };

  const getFileIcon = (fileUrl: string) => {
    const fileName = fileUrl.split('/').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const getFileName = (fileUrl: string) => {
    return fileUrl.split('/').pop() || 'Fichier';
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm text-gray-500">
          {files.length}/{maxFiles} fichiers
        </span>
      </div>

      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {/* Zone d'upload */}
      {canAddMore && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Glissez vos fichiers ici ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-gray-500">
              {acceptedTypes.join(', ')} jusqu'à 10MB chacun
            </p>
            <Input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`)?.click()}
              disabled={uploading}
              className="mt-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Téléchargement...' : 'Sélectionner des fichiers'}
            </Button>
          </div>
        </div>
      )}

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileUrl, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(fileUrl)}
                <span className="text-sm font-medium truncate">
                  {getFileName(fileUrl)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!canAddMore && (
        <p className="text-sm text-orange-600 text-center">
          Limite de {maxFiles} fichiers atteinte
        </p>
      )}
    </div>
  );
};

export default FileUpload;
