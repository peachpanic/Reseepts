"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { motion } from "framer-motion";
import { useState } from "react"

type timePeriodProps = {
    value?: string;
    onChange?: (v: string) => void;
}

const FILTERS = ['day', 'week', 'month', 'year']
export function TimePeriodFilter({ value = "day", onChange }: timePeriodProps) {
    const filter = value;

    return (
        <div className='w-full'>
            <ToggleGroup
                type='single'
                value={filter}
                className='w-full px-4'
                onValueChange={(v) => typeof v === 'string' && onChange?.(v)}
            >
                {FILTERS.map((f) => (
                    <ToggleGroupItem
                        key={f}
                        value={f}
                        className="relative px-3 py-2 rounded-lg bg-transparent"
                    >
                        {/* Animated background pill (shared layoutId) */}
                        {filter === f && (
                            <motion.span
                                layoutId="highlight"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute inset-0 bg-teal-600 rounded-lg shadow-sm"
                            />
                        )}

                        {/* Label above the animated pill */}
                        <span
                            className={`relative z-10 select-none pointer-events-none text-sm font-medium 
                            ${filter === f ? "text-white" : "text-gray-700"}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </span>
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    )
}