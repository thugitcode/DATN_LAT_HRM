export type ConfirmAction = 'approve' | 'reject';

export interface ConfirmConfig {
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor?: 'primary' | 'danger';
  requireReason?: boolean;
}
