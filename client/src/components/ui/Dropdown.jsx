import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Generic Dropdown (single or multi-select) service component
 * @param {Array} items - List of { value, label, left? }
 * @param {any|Array} value - Selected value (or array of values if multiple)
 * @param {Function} onChange - Callback with new value(s)
 * @param {boolean} multiple - Enable multi-select
 * @param {Function} renderTrigger - Custom trigger renderer
 * @param {Function} renderListItem - Custom list item renderer
 * @param {string} placeholder - Placeholder text
 */
export const Dropdown = ({
    items,
    value,
    onChange,
    multiple = false,
    renderTrigger,
    renderListItem,
    placeholder = 'Select...'
}) => {
    const [open, setOpen] = useState(false);
    const selectedItems = multiple
        ? items?.filter(i => Array.isArray(value) && value.includes(i.value))
        : items?.find(i => i.value === value) ? [items.find(i => i.value === value)] : [];

    const toggleItem = (item) => {
        if (!multiple) {
            onChange(item.value);
            setOpen(false);
            return;
        }
        const exists = Array.isArray(value) && value.includes(item.value);
        let next;
        if (exists) {
            next = value.filter(v => v !== item.value);
        } else {
            next = [...(value || []), item.value];
        }
        onChange(next);
    };

    console.log(items, "items");


    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="input-field w-full flex flex-wrap items-center justify-between min-h-[2.5rem]"
            >
                {renderTrigger ? renderTrigger({ selected: multiple ? selectedItems : selectedItems[0], placeholder }) : (
                    <div className="flex flex-wrap items-center">
                        {selectedItems?.length > 0
                            ? selectedItems?.map(i => (
                                <div key={i.value} className="flex -space-x-2 ml-auto bg-gray-100 px-1 dark:bg-gray-700 py-0.5 rounded-full">
                                    {i.left ? i.left : i.label}
                                    {/* {i.left} */}
                                    {/* <span className="text-sm text-gray-800 dark:text-gray-100">{i.label}</span> */}
                                </div>
                            ))
                            : <span className="text-gray-400">{placeholder}</span>
                        }
                    </div>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto rounded-md py-1"
                    >
                        {items?.map(item => {
                            const isSelected = multiple
                                ? Array.isArray(value) && value.includes(item.value)
                                : value === item.value;
                            return (
                                <li
                                    key={item.value}
                                    onClick={() => {
                                        toggleItem(item)
                                        setOpen(false);
                                    }}
                                    className={`cursor-pointer select-none px-3 py-2 flex items-center space-x-2 hover:bg-primary-100 dark:hover:bg-gray-700 ${isSelected ? 'bg-primary-200 dark:bg-gray-700' : ''}`}
                                >
                                    {renderListItem
                                        ? renderListItem({ item, isSelected })
                                        : (
                                            <>
                                                {item.left}
                                                <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{item.label}</span>
                                                {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                                            </>
                                        )
                                    }
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};
