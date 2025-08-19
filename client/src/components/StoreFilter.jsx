"use client"

import { Store } from "lucide-react"

export default function StoreFilter({ value, onChange }) {
  const stores = [
    { value: "all", label: "All Locations" },
    { value: "downtown", label: "Downtown Location" },
    { value: "uptown", label: "Uptown Location" },
    { value: "mall", label: "Mall Location" },
  ]

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {stores.map((store) => (
          <option key={store.value} value={store.value}>
            {store.label}
          </option>
        ))}
      </select>
      <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  )
}
