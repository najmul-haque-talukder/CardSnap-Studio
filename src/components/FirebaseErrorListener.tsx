'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { toast } from '@/hooks/use-toast';

export const FirebaseErrorListener: React.FC = () => {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      console.error('Firebase Permission Error:', error);
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Please check your Firebase Security Rules and ensure you are authorized.",
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, []);

  return null;
};
