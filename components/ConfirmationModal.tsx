import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-main text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pop-in">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-text-main mb-2">{title}</h3>
        <p className="text-text-muted mb-6">{message}</p>
        
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 mb-6">
          <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Ação Irreversível</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};