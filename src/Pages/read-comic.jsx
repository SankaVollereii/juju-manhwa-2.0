import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const ReadComic = () => {
    const navigate = useNavigate()
    const { slug, chapterSlug } = useParams()
    const location = useLocation()
    
    const { 
        chapterLink, 
        comicTitle, 
        chapterNumber 
    } = location.state || {}
    
    const [pages, setPages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [currentChapters, setCurrentChapters] = useState([])
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0)

    // Fetch chapter pages
  useEffect(() => {
    const fetchChapterPages = async () => {
        if (!chapterLink) {
            setError(new Error('No chapter link provided'))
            setLoading(false)
            return
        }

        try {
            // Fetch chapter pages
            const response = await axios.get(`https://www.sankavollerei.com/comic/chapter/${chapterLink}`)
            
            console.log("Fetched chapter pages:", response.data)
            
            // Tambahkan pengecekan null/undefined
            const chapters = response.data.chapters || []
            const images = response.data.images || []

            setPages(images)
            setCurrentChapters(chapters)
                
            // Tambahkan pengecekan sebelum findIndex
            if (chapters.length > 0) {
                const chapterIndex = chapters.findIndex(
                    ch => String(ch.chapter) === String(chapterNumber)
                )
                
                // Gunakan -1 sebagai default jika tidak ditemukan
                setCurrentChapterIndex(chapterIndex !== -1 ? chapterIndex : 0)
            } else {
                setCurrentChapterIndex(0)
            }
                
            setLoading(false)
        } catch (err) {
            setError(err)
            setLoading(false)
            // Fallback images
            setPages([
                'https://picsum.photos/800/1200?random=1',
                'https://picsum.photos/800/1200?random=2',
                'https://picsum.photos/800/1200?random=3',
                'https://picsum.photos/800/1200?random=4'
            ])
        }
    }

    fetchChapterPages()
}, [chapterLink, chapterNumber])

    // Scroll progress tracking
    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.documentElement.scrollTop
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
            const scrolled = (winScroll / height) * 100
            setScrollProgress(scrolled)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Handle back to detail page
    const handleBack = () => {
        navigate(`/detail-comic/${slug}`)
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                <h2>Terjadi Kesalahan</h2>
                <p>{error.message}</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-100">
            {/* Header Fixed */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md py-4 px-6 z-20 flex justify-between items-center">
                <button 
                    onClick={handleBack}
                    className="text-gray-600 hover:text-gray-900"
                >
                    ← Kembali
                </button>
                <h2 className="text-xl font-bold">
                    {comicTitle} - Chapter {chapterNumber || 'Unknown'}
                </h2>
                <div className="w-10"></div>
            </div>

            {/* Progress Bar */}
            <div 
                className="fixed top-16 left-0 right-0 h-1 bg-gray-200 z-20"
                style={{ zIndex: 30 }}
            >
                <div 
                    className="bg-blue-500 h-full" 
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>


            {/* Konten Komik */}
            <div className="container mx-auto px-4 pt-24 pb-20">
                {pages.map((page, index) => (
                    <img 
                        key={index} 
                        src={page} 
                        alt={`Halaman ${index + 1}`}
                        className="w-full object-contain"
                        loading="lazy"
                    />
                ))}
            </div>

            {/* Footer */}
            <div className="bg-white shadow-md py-2 px-6 text-center">
                <span className="text-sm text-gray-600">
                    Akhir Chapter
                </span>
            </div>
        </div>
    )
}

export default ReadComic
