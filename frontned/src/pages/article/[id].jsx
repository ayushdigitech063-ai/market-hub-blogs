import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArticleCard from '../../components/ArticleCard';
import ArticleBody from '../../components/ArticleBody';

export default function ArticleDetail() {
  const { id } = useParams();
  const scrollRef = useRef(null);

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    Promise.all([
      fetch(`https://market-hub-blogs-backend.onrender.com/api/articles/${id}`).then((res) => res.json()),
      fetch(`https://market-hub-blogs-backend.onrender.com/api/articles`).then((res) => res.json()),
    ])
      .then(([articleData, allArticles]) => {
        setArticle(articleData);
        // Current article ko chhod kar baaki articles related mein dikhao
        const filtered = allArticles.filter(
          (item) => String(item.id || item._id) !== String(id)
        );
        setRelatedArticles(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching article details:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-600 font-semibold text-lg">Loading article...</p>
      </div>
    );
  }

  if (!article || article.message) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
        <Link to="/" className="text-red-600 underline font-semibold">Go back to Home</Link>
      </div>
    );
  }


  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-red-600 transition mb-6 inline-block">
        ← Back to Home
      </Link>

      <div className="mb-6">
        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {article.category}
        </span>
        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mt-4 mb-4 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex items-center space-x-3 text-sm text-gray-600 border-b border-gray-200 pb-6 mb-6">
          <span className="font-bold text-gray-900">By {article.author || article.authorId}</span>
          <span>•</span>
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-lg mb-8 max-h-[450px]">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
      </div>

      {article.contentHtml ? (

        <div className="prose max-w-none text-gray-700 leading-relaxed text-base mb-16">
          <ArticleBody post={article} />
        </div>
      ) : (
        <div className="prose max-w-none text-gray-700 leading-relaxed text-base space-y-4 mb-16">
          <p className="font-semibold text-lg text-gray-950">{article.description || (article.content && article.content[0])}</p>
          {Array.isArray(article.content) ? (
            article.content.slice(1).map((para, index) => <p key={index}>{para}</p>)
          ) : (
            <p>{article.content}</p>
          )}
        </div>
      )}


      <div className="border-t border-gray-200 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-gray-900">Related Articles</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-800 font-bold transition cursor-pointer shadow-sm"
              aria-label="Scroll Left"
            >
              ←
            </button>
            <button 
              onClick={scrollRight}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-800 font-bold transition cursor-pointer shadow-sm"
              aria-label="Scroll Right"
            >
              →
            </button>
          </div>
        </div>


        <div 
          ref={scrollRef} 
          className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {relatedArticles.map((relArticle) => (
            <div key={relArticle.id || relArticle._id} className="min-w-[300px] max-w-[300px] flex-shrink-0">
              <ArticleCard article={relArticle} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}