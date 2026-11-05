export type GalaxyBackground = { id: string; name: string; theme: string; image: string; mobileImage: string; thumbnail: string; source: string; credit: string; originalTitle: string; width?: number; height?: number; sourceWidth?: number; sourceHeight?: number; sourceImage?: string }

export const GALAXY_THEMES = ["Milky Way galaxy"] as const

export const GALAXY_BACKGROUNDS: readonly GalaxyBackground[] = [
  {
    "id": "galaxy-01",
    "name": "Milky Way Panorama",
    "theme": "Milky Way galaxy",
    "image": "/images/galaxy-backgrounds/galaxy-01-hd.jpg",
    "mobileImage": "/images/galaxy-backgrounds/galaxy-01-mobile-hd.jpg",
    "thumbnail": "/images/galaxy-backgrounds/galaxy-01-preview-hd.jpg",
    "source": "https://www.eso.org/public/images/eso0932a/",
    "credit": "ESO/S. Brunier",
    "originalTitle": "The Milky Way panorama",
    "width": 3840,
    "height": 2160,
    "sourceWidth": 6000,
    "sourceHeight": 3000,
    "sourceImage": "https://cdn.eso.org/images/large/eso0932a.jpg"
  }
]

export function getGalaxyBackground(id: string) { return GALAXY_BACKGROUNDS.find(background => background.id === id) ?? GALAXY_BACKGROUNDS[0] }
