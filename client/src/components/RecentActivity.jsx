"use client"

import { Clock, CheckCircle } from "lucide-react"

export default function RecentActivity({ transactions = [] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <div key={transaction.id || index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Payment from {transaction.customer}</span>
                  <p className="text-xs text-gray-500">${transaction.amount}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{transaction.time}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
