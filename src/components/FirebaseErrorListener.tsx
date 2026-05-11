'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export const FirebaseErrorListener: React.FC = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Avoid console.error to keep the interface clean from captured empty objects
      toast({
        variant: "destructive",
        title: "Firebase Error",
        description: error.message || "Request failed. This usually means Security Rules or Storage buckets are not configured correctly in the Firebase Console.",
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
};