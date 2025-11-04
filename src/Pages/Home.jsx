import React, { useState } from 'react'
import CardNewComic from '../components/Home/CardNewComic'
import SearchComic from '../components/Home/SearchComic'
import CardTerbaruComic from '../components/Home/CardTerbaruComic'
import CardTrendingComic from '../components/Home/CardTrendingComic'

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="bg-[#121212] min-h-screen text-gray-100 py-8">
      <SearchComic />
      {currentPage === 1 && (
        <>
          <CardTerbaruComic /> 
          <CardTrendingComic /> 
        </>
      )}
      <CardNewComic 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  )
}

export default Home