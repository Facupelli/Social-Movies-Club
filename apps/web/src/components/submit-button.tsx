'use client';

import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  children: React.ReactNode;
  loadingText?: string;
  showSpinner?: boolean;
  disabled?: boolean;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  formAction?: (formData: FormData) => void;
}

export function SubmitButton({
  children,
  loadingText = 'Loading...',
  showSpinner = true,
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  formAction,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={className}
      disabled={disabled || pending}
      formAction={formAction}
      size={size}
      type="submit"
      variant={variant}
    >
      {pending && showSpinner && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {pending ? loadingText : children}
    </Button>
  );
}
