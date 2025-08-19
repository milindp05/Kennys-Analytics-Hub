"use client"

import { useState } from "react"
import { useInstagramData } from "../../hooks/useInstagramData"
import { Instagram, Users, Heart, MessageCircle, Eye, TrendingUp, RefreshCw, AlertCircle } from "lucide-react"
import DateRangePicker from "../DateRangePicker"
import InstagramKPICard from "../InstagramKPICard"
import TopPostsGrid from "../TopPostsGrid"
import AudienceInsights from "../AudienceInsights"
import HashtagPerformance from "../HashtagPerformance"

export default function Social() {
  const [dateRange, setDateRange] = useState("7d")
  const { data, loading, error, lastUpdated, refetch } = useInstagramData(dateRange)

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-gray-600">Loading Instagram insights...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-red-600">Failed to load Instagram data</p>
            <p className="text-sm text-gray-500">{error}</p>
            <button onClick={refetch} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const kpis = [
    {
      title: "Follower Change",
      value: `+${data?.insights?.followerChange?.value || 0}`,
      change: data?.insights?.followerChange?.change || "+0%",
      trend: data?.insights?.followerChange?.trend || "up",
      icon: Users,
      color: "primary",
      subtitle: data?.insights?.followerChange?.period,
    },
    {
      title: "Engagement Rate",
      value: `${data?.insights?.engagement?.rate?.toFixed(1) || 0}%`,
      change: data?.insights?.engagement?.change || "+0%",
      trend: data?.insights?.engagement?.trend || "up",
      icon: Heart,
      color: "pink",
      subtitle: "Average per post",
    },
    {
      title: "Total Reach",
      value: data?.insights?.reach?.value?.toLocaleString() || "0",
      change: data?.insights?.reach?.change || "+0%",
      trend: data?.insights?.reach?.trend || "up",
      icon: Eye,
      color: "mint",
      subtitle: data?.insights?.reach?.period,
    },
    {
      title: "Impressions",
      value: data?.insights?.impressions?.value?.toLocaleString() || "0",
      change: data?.insights?.impressions?.change || "+0%",
      trend: data?.insights?.impressions?.trend || "up",
      icon: TrendingUp,
      color: "primary",
      subtitle: data?.insights?.impressions?.period,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Social Media Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Instagram insights and social media performance
            {lastUpdated && (
              <span className="ml-2 text-gray-400">• Last updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button onClick={refetch} disabled={loading} className="btn-outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="card p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
            <Instagram className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">@{data?.profile?.username}</h3>
            <p className="text-gray-600 mt-1">{data?.profile?.biography}</p>
            <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
              <span>
                <strong className="text-gray-900">{data?.profile?.followersCount?.toLocaleString()}</strong> followers
              </span>
              <span>
                <strong className="text-gray-900">{data?.profile?.followingCount?.toLocaleString()}</strong> following
              </span>
              <span>
                <strong className="text-gray-900">{data?.profile?.mediaCount}</strong> posts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <InstagramKPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Posts */}
        <div className="lg:col-span-2">
          <TopPostsGrid posts={data?.insights?.topPosts || []} />
        </div>

        {/* Audience Insights */}
        <AudienceInsights insights={data?.insights?.audienceInsights} />

        {/* Hashtag Performance */}
        <HashtagPerformance hashtags={data?.insights?.hashtagPerformance || []} />
      </div>

      {/* Engagement Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Summary</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{data?.insights?.engagement?.totalLikes || 0}</p>
            <p className="text-sm text-gray-600">Total Likes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageCircle className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{data?.insights?.engagement?.totalComments || 0}</p>
            <p className="text-sm text-gray-600">Total Comments</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{data?.insights?.engagement?.rate?.toFixed(1) || 0}%</p>
            <p className="text-sm text-gray-600">Avg Engagement</p>
          </div>
        </div>
      </div>
    </div>
  )
}
