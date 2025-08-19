"use client"

import { Award } from "lucide-react"

export default function TopMenuItems({ items = [] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Menu Items</h3>
        <Award className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      index === 0
                        ? "bg-primary-500"
                        : index === 1
                          ? "bg-mint-500"
                          : index === 2
                            ? "bg-pink-500"
                            : "bg-gray-400"
                    }`}
                  ></div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <p className="text-xs text-gray-500">${item.revenue?.toLocaleString()} revenue</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{item.orders}</span>
                <p className="text-xs text-gray-500">orders</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No menu data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
