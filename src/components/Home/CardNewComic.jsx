import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CardNewComic = ({ currentPage, setCurrentPage }) => {
    const [comics, setComics] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hasNextPage, setHasNextPage] = useState(true)

    const navigate = useNavigate()

    const fetchComics = async () => {
        setLoading(true);
        setError(null);
        window.scrollTo(0, 0); 
        
        try {
            let pagesToFetch = [];
            const pagesPerLoad = 2; // Muat 3 API sekaligus

            if (currentPage === 1) {
                pagesToFetch.push(1);
            } else {
                const startPage = ((currentPage - 2) * pagesPerLoad) + 2;
                for (let i = 0; i < pagesPerLoad; i++) {
                    pagesToFetch.push(startPage + i);
                }
            }
            const fetchPromises = pagesToFetch.map(page =>
                axios.get(`https://www.sankavollerei.com/comic/pustaka/${page}`)
            );

            const responses = await Promise.all(fetchPromises);

            let allRawComics = [];
            let anyPageHasData = false;

            for (const response of responses) {
                const rawComics = response.data.results || [];
                if (rawComics.length > 0) {
                    anyPageHasData = true;
                    allRawComics.push(...rawComics);
                }
            }
            
            setHasNextPage(anyPageHasData);

            const filteredComics = allRawComics.filter(item => 
                !item.title.toLowerCase().includes('apk') && 
                (item.latestChapter && !item.latestChapter.title.toLowerCase().includes('download'))
            );

            const processedComics = filteredComics.map(comic => {
                const slug = comic.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')  
                    .replace(/^-+|-+$/g, '');  
                const chapterNumber = comic.latestChapter?.title.split(' ').pop() || 'N/A';
                return {
                    title: comic.title,
                    image: comic.thumbnail,
                    chapter: chapterNumber, 
                    source: comic.type || 'N/A',
                    popularity: comic.genre || 'N/A',
                    processedLink: comic.detailUrl.replace('/detail-komik/', ''),
                    slug: slug
                }
            })

            setComics(processedComics);

        } catch (err) {
            if (err.response && err.response.status === 404) {
                setHasNextPage(false);
                if (currentPage > 1) setComics([]); 
            } else {
                setError(err)
                console.error("Error fetching pustaka comics:", err)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComics()
    }, [currentPage])

    const handleNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    }
    
    const handlePrevPage = () => {
        setCurrentPage(prevPage => (prevPage > 1 ? prevPage - 1 : 1));
        if (currentPage > 1) {
            setHasNextPage(true); 
        }
    }

    const handleComicDetail = (comic) => {
        navigate(`/detail-comic/${comic.slug}`, { 
            state: { 
                comic: comic,
                processedLink: comic.processedLink 
            } 
        })
    }

    if (loading && currentPage === 1 && comics.length === 0) { 
        return (
            <div className="flex justify-center items-center h-screen bg-[#121212]">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-red-400 p-4 bg-[#121212]">
                <h2>Terjadi Kesalahan saat memuat Pustaka Komik</h2>
                <p>{error.message}</p>
            </div>
        )
    }
    if (!loading && !error && comics.length === 0) {
         return (
             <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">
                    {currentPage === 1 ? "Pustaka Komik Terbaru" : `Pustaka Komik (Halaman ${currentPage})`}
                </h2>
                <p className="text-center text-gray-400">
                    Tidak ada komik lagi yang ditemukan.
                </p>
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1 || loading}
                        className="bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-600 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Sebelumnya
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={true} 
                        className="bg-gray-700 text-white px-6 py-2 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Berikutnya
                    </button>
                </div>
             </div>
         )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">
                {currentPage === 1 ? "Pustaka Komik Terbaru" : `Pustaka Komik (Halaman ${currentPage})`}
            </h2>
            
            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 lg:grid-cols-5 md:mx-16 gap-4">
                    {comics.map((comic, index) => (
                        <div
                            key={`${comic.slug}-${index}`}
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
                                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                                    Ch. {comic.chapter}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg truncate mb-2 text-gray-100">{comic.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">{comic.source}</span>
                                    <span className="text-sm text-gray-400">★ {comic.popularity}</span>
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
            )}
            
            <div className="flex justify-center gap-4 mt-8">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || loading}
                    className="bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-600 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {loading ? 'Memuat...' : 'Sebelumnya'}
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={!hasNextPage || loading}
                    className="bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-600 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {loading ? 'Memuat...' : 'Berikutnya'}
                </button>
            </div>
        </div>
    )
}

export default CardNewComic