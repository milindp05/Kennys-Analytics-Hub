"use client"

import { Hash, TrendingUp } from "lucide-react"

export default function HashtagPerformance({ hashtags = [] }) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Hash className="h-5 w-5 mr-2" />
        Hashtag Performance
      </h3>

      <div className="space-y-3">
        {hashtags.slice(0, 8).map((hashtag, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
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
              <span className="text-sm font-medium text-gray-900">{hashtag.hashtag}</span>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {hashtag.reach?.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">{hashtag.uses} uses</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">Showing top performing hashtags by reach and engagement</p>
      </div>
    </div>
  )
}
