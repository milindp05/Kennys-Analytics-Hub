"use client"

import { Heart, MessageCircle, Eye } from "lucide-react"

export default function TopPostsGrid({ posts = [] }) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 6).map((post, index) => (
          <div key={post.id} className="group relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={post.thumbnailUrl || "/placeholder.svg"}
                alt={`Post ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{post.engagement}% engagement</span>
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {post.reach}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
