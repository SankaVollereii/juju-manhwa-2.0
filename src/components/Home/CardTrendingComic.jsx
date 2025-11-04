import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CardTrendingComic = () => {
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const fetchComics = async () => {
    try {
      const response = await axios.get('https://www.sankavollerei.com/comic/trending')

      const rawComics = response.data.trending || []

      const filteredComics = rawComics.filter(item => 
        !item.title.toLowerCase().includes('apk') && 
        !item.chapter.toLowerCase().includes('download')
      )
      
      const processedComics = filteredComics.map(comic => {
        const slug = comic.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const link = comic.link.replace('/manga/', '/').replace('/plus/', '/');

        const imageUrl = comic.image && !comic.image.includes('lazy.jpg')
          ? comic.image
          : 'https://via.placeholder.com/300x450?text=Trending+Cover';
        
        return {
          ...comic,
          image: imageUrl,
          processedLink: link,
          slug: slug,
          source: comic.timeframe || '-',
          popularity: comic.trending_score || 0
        }
      })

      setComics(processedComics)
      setLoading(false)

    } catch (err) {
      setError(err)
      setLoading(false)
      console.error("Error fetching trending comics:", err)
    }
  }

  useEffect(() => {
    fetchComics()
  }, [])

  const handleComicDetail = (comic) => {
    navigate(`/detail-comic/${comic.slug}`, { 
      state: { 
        comic: {
          title: comic.title,
          image: comic.image,
          chapter: comic.chapter,
          source: comic.source, 
          popularity: comic.popularity
        },
        processedLink: comic.processedLink 
      } 
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4 bg-[#121212]">
        <h2>Terjadi Kesalahan saat memuat Trending</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">Trending Hari Ini</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:grid-cols-4 md:mx-16 gap-4">
        {comics.map((comic) => (
          <div
            key={comic.title}
            className="bg-[#1E1E1E] shadow-2xl rounded-lg overflow-hidden transform transition duration-300 hover:scale-105"
          >
            <div className="relative">
              <img
                src={comic.image}
                alt={comic.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x450?text=Comic+Cover'
                }}
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded">
                {comic.chapter}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg truncate mb-2 text-gray-100">{comic.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{comic.source}</span>
                <span className="text-sm text-gray-400">🔥 {comic.popularity}</span>
              </div>
              <button
                onClick={() => handleComicDetail(comic)}
                className="mt-2 block w-full bg-indigo-700 text-white py-2 rounded hover:bg-indigo-600 transition text-center"
              >
                Baca Komik
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CardTrendingComic