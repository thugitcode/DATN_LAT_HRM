import { useCallback, useEffect } from 'react';

import { FilterSelect } from '@/components/filters/filter-select';
import { SearchInput } from '@/components/filters/search-input';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { icons } from '@/lib/icons';
import type { ShiftManagementParams } from '@/types';
import { Chip, Select, SelectItem, type SharedSelection } from '@heroui/react';

export const PageFilter: React.FC = () => {
    const { filters, setFilter } = useQueryFilter<ShiftManagementParams>();
    const handleSearchChange = useCallback(
        (value: string | undefined) => {
            setFilter('search', value);
        },
        [setFilter],
    );

    const handleFilter = useCallback(
        (keys: SharedSelection) => {
            
            // const values = Array.from(keys) as string[];            
            setFilter("sortBy", keys.currentKey); // truyền nguyên mảng
        },
        [setFilter],
    );

    const options = [
        { label: "Đã mở gần đây", key: "RECENTLY_OPENED" },
        { label: "Thêm mới gần đây", key: "RECENTLY_ADDED" },
    ]
    
    return (
        <div className="flex items-center gap-3 justify-between">
            <div className='flex-1'>
                <SearchInput value={filters.search} onChange={handleSearchChange} startIcon={icons.search} />
            </div>

            <div className='w-[26.5%] max-w-[320px]'>
                {/* <FilterSelect
                    multiple={true}
                    options={options}
                    value={filters.filter as string}
                    onChange={handleFilter}
                // placeholder="Khoa"
                /> */}
                <Select
                    classNames={{ trigger: "bg-white" }}
                    // selectionMode="multiple"
                    onSelectionChange={(values) => handleFilter(values)}
                    defaultSelectedKeys={["RECENTLY_ADDED"]}
                    renderValue={(items) => {                        
                        return (
                            <div className="flex flex-nowrap gap-2">
                                {items.map((item) => (
                                    <Chip key={item.key}>{item?.textValue}</Chip>
                                ))}
                            </div>
                        );
                    }}
                >
                    {options.map((op) => (
                        <SelectItem key={op.key}>{op.label}</SelectItem>
                    ))}
                </Select>
            </div>
        </div>
    );
};
