import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom'
import axios from 'axios'

const DetailComic = () => {
    const navigate = useNavigate()
    const { slug } = useParams()
    const location = useLocation()
    const { comic, processedLink } = location.state || {}
    const [comicDetail, setComicDetail] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [history, setHistory] = useState(null)
    const [recommendations, setRecommendations] = useState([])

    useEffect(() => {
        const fetchComicDetail = async () => {
            try {
                const cleanProcessedLink = processedLink?.startsWith('/') ? processedLink.substring(1) : processedLink
                
                const response = await axios.get(`https://www.sankavollerei.com/comic/comic/${cleanProcessedLink}`)
                console.log("Fetched comic detail:", response.data)

                if (!response.data) {
                    throw new Error('Tidak ada data komik yang ditemukan')
                }

                setComicDetail(response.data)
                setLoading(false)
            } catch (err) {
                console.error("Error fetching comic detail:", err)
                setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengambil detail komik')
                setLoading(false)
                setComicDetail({
                    synopsis: "Synopsis tidak tersedia.",
                    chapters: [],
                    creator: "Unknown"
                })
            }
        }

        const fetchRecommendations = async () => {
            try {
                const response = await axios.get('https://www.sankavollerei.com/comic/recommendations');
                
                const processedRecommendations = response.data.recommendations.map(item => {
                    const slug = item.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    
                    const link = item.link.replace('/manga/', '').replace('/detail-komik/', ''); 
                    
                    return {
                        ...item,
                        slug: slug,
                        processedLink: link, 
                        source: item.reason || '-', 
                        popularity: item.recommendation_score ? item.recommendation_score.toFixed(2) : '-',
                        image: item.image.includes('lazy.jpg') ? 'https://via.placeholder.com/300x450?text=Recomendasi' : item.image,
                    };
                });
                
               const filteredRecommendations = processedRecommendations.filter(item => 
                    !item.title.toLowerCase().includes('apk') && 
                    !item.chapter.toLowerCase().includes('download')
                );

                setRecommendations(filteredRecommendations.filter(r => r.slug !== slug).slice(0, 8));
            } catch (err) {
                console.error("Error fetching recommendations:", err);
            }
        };

        if (processedLink) {
            fetchComicDetail()
        } else {
            setError('Link komik tidak valid')
            setLoading(false)
        }
        
        fetchRecommendations();

        const loadHistory = () => {
            try {
                const historyData = JSON.parse(localStorage.getItem('comicHistory'))
                if (historyData && historyData[slug]) {
                    setHistory(historyData[slug])
                }
            } catch (e) {
                console.error("Error loading history from local storage", e)
            }
        }
        loadHistory()
        
    }, [processedLink, slug])

    if (loading) {
        return (
            <div className="bg-[#121212] flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-[#121212] min-h-screen text-center text-red-400 p-4 pt-10">
                <h2>Terjadi Kesalahan</h2>
                <p>{error.message}</p>
            </div>
        )
    }

    if (!comic) {
        return <div className="bg-[#121212] min-h-screen text-gray-100 text-center pt-10">Komik tidak ditemukan</div>
    }

    const handleReadComic = (chapterData = null) => {
        let chapterToRead;

        if (chapterData) {
            chapterToRead = chapterData;
        } else if (comicDetail?.chapters && comicDetail.chapters.length > 0) {
            chapterToRead = comicDetail.chapters[0];
        } else {
            alert('No chapters available');
            return;
        }
        
        navigate(`/read-comic/${slug}/chapter-${chapterToRead.chapter}`, { 
            state: { 
                chapterLink: chapterToRead.link,
                comicTitle: comic.title,
                chapterNumber: chapterToRead.chapter,
                comicDetailState: { comic: comic, processedLink: processedLink }, 
            } 
        })
    }

    const handleContinueReading = () => {
        if (history) {
            const chapterData = {
                link: history.lastChapterLink,
                chapter: history.lastChapter,
            }
            handleReadComic(chapterData)
        }
    }

    const handleRecommendationDetail = (item) => {
        navigate(`/detail-comic/${item.slug}`, { 
            state: { 
                comic: {
                    title: item.title,
                    image: item.image,
                    chapter: item.chapter,
                    source: item.source,
                    link: item.link, 
                    popularity: item.popularity
                },
                processedLink: item.processedLink
            } 
        });
        window.location.reload(); 
    }

    const isLatestChapter = history?.lastChapter === comic.chapter;

    return (
        <div className="bg-[#121212] min-h-screen text-gray-100 py-6">
            <div className="container mx-auto p-6">
                
                <div className="flex flex-col md:flex-row gap-6">
                    
                    <div className="md:w-2/3">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 mb-6 md:mr-6">
                                <img
                                    src={comic.image}
                                    alt={comic.title}
                                    className="w-full rounded-lg shadow-lg"
                                />
                            </div>
                            <div className="md:w-2/3">
                                <h1 className="text-3xl font-bold mb-4">{comic.title}</h1>

                                <div className="mb-4">
                                    <strong>Chapter:</strong> {comic.chapter}
                                </div>

                                <div className="mb-4">
                                    <strong className="block mb-2">Synopsis:</strong>
                                    <p className="text-gray-400 leading-relaxed">
                                        {comicDetail?.synopsis || "Synopsis tidak tersedia."}
                                    </p>
                                </div>

                                <div className="flex space-x-4 mt-6">
                                    <button
                                        onClick={() => handleReadComic()}
                                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                                    >
                                        Baca Dari Awal
                                    </button>
                                    
                                    <button
                                        onClick={() => navigate('/')}
                                        className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
                                    >
                                        Home
                                    </button>
                                </div>
                            </div>
                        </div>

                        {history && !isLatestChapter && (
                            <div className="mt-6 p-4 bg-[#1E1E1E] border border-indigo-700 rounded-lg shadow-md">
                                <p className="font-semibold text-white">
                                    Lanjutkan Membaca
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Chapter Terakhir Dibaca: <span className="text-indigo-400">Chapter {history.lastChapter}</span>
                                </p>
                                <button
                                    onClick={handleContinueReading}
                                    className="mt-3 bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-600 transition text-sm"
                                >
                                    Lanjutkan Chapter {history.lastChapter}
                                </button>
                            </div>
                        )}

                        {/* Daftar Chapter */}
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-3">Daftar Chapter</h3>
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                               {comicDetail?.chapters?.map((chapter, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleReadComic(chapter)}
                                        className={`p-2 rounded text-center text-sm transition ${
                                            String(chapter.chapter) === String(history?.lastChapter)
                                                ? 'bg-yellow-600 text-white font-bold'
                                                : 'bg-indigo-700 hover:bg-indigo-600 text-white'
                                        }`}
                                    >
                                        {chapter.chapter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {recommendations.length > 0 && (
                        <div className="md:w-1/3 mt-6 md:mt-0">
                            <h2 className="text-xl font-bold mb-4 text-center">Rekomendasi Comic</h2>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                                {recommendations.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-[#1E1E1E] rounded-lg overflow-hidden transform transition duration-300 hover:scale-[1.03] cursor-pointer shadow-lg"
                                        onClick={() => handleRecommendationDetail(item)}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-40 object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x450?text=Recomendasi'
                                            }}
                                        />
                                        <div className="p-3">
                                            <h3 className="font-semibold text-sm truncate text-gray-100">{item.title}</h3>
                                            <span className="text-xs text-gray-400">Chp: {item.chapter.split(' ').pop()} | Score: {item.popularity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DetailComic