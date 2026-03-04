import { useCallback, useEffect } from 'react';

import { FilterSelect } from '@/components/filters/filter-select';
import { SearchInput } from '@/components/filters/search-input';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { icons } from '@/lib/icons';
import type { ShiftManagementParams } from '@/types';
import { Select, SelectItem, type SharedSelection } from '@heroui/react';

export const PageFilter: React.FC = () => {
    const { filters, setFilter } = useQueryFilter<ShiftManagementParams>();
    // useEffect(() => {
    //     setFilter("filter", "DA_MO_GAN_DAY")
    // }, [])
    const handleSearchChange = useCallback(
        (value: string | undefined) => {
            setFilter('search', value);
        },
        [setFilter],
    );

    const handleFilter = useCallback(
        (keys: SharedSelection) => {
            const values = Array.from(keys) as string[];

            setFilter("filter", values); // truyền nguyên mảng
        },
        [setFilter],
    );

    const options = [
        { label: "Đã mở gần đây", key: "DA_MO_GAN_DAY" },
        { label: "Thêm mới gần đây", key: "THEM_MOI_GAN_DAY" },
    ]
    
    return (
        <div className="flex items-center gap-3 justify-between">
            <div className='flex-1'>
                <SearchInput value={filters.search} onChange={handleSearchChange} startIcon={icons.search} />
            </div>

            <div className='w-1/4'>
                {/* <FilterSelect
                    multiple={true}
                    options={options}
                    value={filters.filter as string}
                    onChange={handleFilter}
                // placeholder="Khoa"
                /> */}
                <Select
                    className="max-w-xs"
                    classNames={{ trigger: "bg-white" }}
                    selectionMode="multiple"
                    onSelectionChange={(values) => handleFilter(values)}
                    defaultSelectedKeys={"DA_MO_GAN_DAY"}
                >
                    {options.map((animal) => (
                        <SelectItem key={animal.key}>{animal.label}</SelectItem>
                    ))}
                </Select>
            </div>
        </div>
    );
};
