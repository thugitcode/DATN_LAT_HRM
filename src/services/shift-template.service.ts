import type { ShiftTemplate, ShiftTemplateParams } from '@/types/shift-template.type';
import { hrmInstance } from '@/lib/axios';
import { BaseApiService } from './base-api.service';

class ShiftTemplateService extends BaseApiService<
    ShiftTemplate,
    Partial<ShiftTemplate>,
    Partial<ShiftTemplate>,
    ShiftTemplateParams
> {
    constructor() {
        super(hrmInstance, '/shift-template');
    }

    async getAll(params?: ShiftTemplateParams) {
        return super.getAll(params);
    }
}

export const shiftTemplateService = new ShiftTemplateService();
