"use client"

import { Users, MapPin, Clock } from "lucide-react"

export default function AudienceInsights({ insights }) {
  if (!insights) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Insights</h3>
        <p className="text-gray-500 text-center py-8">No audience data available</p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Insights</h3>

      {/* Age Demographics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Age Groups
        </h4>
        <div className="space-y-2">
          {insights.demographics?.ageGroups?.map((group, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{group.range}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${group.percentage}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{group.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Cities */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Top Cities
        </h4>
        <div className="space-y-2">
          {insights.demographics?.topCities?.map((city, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{city.city}</span>
              <span className="text-sm font-medium text-gray-900">{city.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Peak Engagement Hours
        </h4>
        <div className="space-y-2">
          {insights.activity?.peakHours?.map((hour, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{hour.hour}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-mint-500 h-2 rounded-full" style={{ width: `${hour.engagement}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{hour.engagement}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
