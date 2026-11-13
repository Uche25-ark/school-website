import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export default function ProfilePhoto({ token, userId, name, className = '', refreshKey = 0 }) {
  const [photoUrl, setPhotoUrl] = useState('')
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  useEffect(() => {
    const controller = new AbortController()
    let objectUrl

    async function loadPhoto() {
      try {
        const response = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/profile-photo`, {
          headers: { authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (response.status === 404) return
        if (!response.ok) throw new Error(`Profile photo request failed (${response.status}).`)
        const photo = await response.blob()
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(photo)
        setPhotoUrl(objectUrl)
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Unable to load user profile photo:', error)
      }
    }

    void loadPhoto()
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [name, refreshKey, token, userId])

  return photoUrl
    ? <img src={photoUrl} alt="" className={`${className} rounded-full object-cover`} />
    : <span aria-hidden="true" className={`${className} flex items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600`}>{initials}</span>
}
