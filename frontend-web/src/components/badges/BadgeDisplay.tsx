'use client'

import { Trophy, Award, Star } from 'lucide-react'

interface Badge {
  id: number
  badge_type: string
  badge_name: string
  badge_description: string
  badge_icon: string
  earned_at: string
}

interface BadgeDisplayProps {
  badges: Badge[]
  showTitle?: boolean
  maxDisplay?: number
}

export function BadgeDisplay({ badges, showTitle = true, maxDisplay }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">Nenhuma conquista ainda</p>
      </div>
    )
  }

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges

  return (
    <div>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Conquistas
        </h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-2">{badge.badge_icon}</div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.badge_name}</h4>
            <p className="text-xs text-gray-600 mb-2">{badge.badge_description}</p>
            <div className="text-xs text-gray-500">
              {new Date(badge.earned_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>
      {maxDisplay && badges.length > maxDisplay && (
        <p className="text-sm text-gray-500 text-center mt-4">
          +{badges.length - maxDisplay} conquistas
        </p>
      )}
    </div>
  )
}

