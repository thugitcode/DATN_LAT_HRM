import { Controller } from 'react-hook-form';
import type { ProbationEvaluationFormValues } from '../schemas/probation-evaluation.schema';

export function ScoreInputRow({
    name,
    label,
}: {
    name: keyof ProbationEvaluationFormValues;
    label: string;
}) {
    return (
        <Controller<ProbationEvaluationFormValues>
            name={name}
            render={({ field }) => {
                const value = field.value !== null && field.value !== undefined ? Number(field.value) : 0;
                return (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-[#52525B]">{label}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-lg leading-7 font-semibold w-[46px] h-[46px] rounded-xl flex items-center justify-center bg-[#F4F4F5] shrink-0">
                                {value}
                            </span>
                            <input
                                type="range"
                                min={0}
                                max={10}
                                step={0.5}
                                value={value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="flex-1 accent-primary"
                            />
                        </div>
                    </div>
                );
            }}
        />
    );
}
