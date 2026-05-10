'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export const FirebaseErrorListener: React.FC = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      console.error('Firebase Error Captured:', error);
      toast({
        variant: "destructive",
        title: "Firebase Error",
        description: error.message || "Missing permissions or Storage not configured correctly. Check Firebase Console.",
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, [toast]);

  return null;
};
