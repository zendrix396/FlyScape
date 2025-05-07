import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DestinationCarousel = ({ destinations, isDark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const timeoutRef = useRef(null);
  const SLIDE_DURATION = 6000; // 6 seconds per slide
  
  // Updated destination images
  const updatedDestinations = destinations.map(destination => {
    const newImage = getUpdatedImage(destination.code);
    return {
      ...destination,
      image: newImage || destination.image
    };
  });
  
  function getUpdatedImage(code) {
    switch(code) {
      case 'BOM':
        return 'https://www.holidaymonk.com/wp-content/uploads/2022/04/Gateway-Of-India-MUMBAI.jpg';
      case 'GOI':
        return 'https://media.istockphoto.com/id/535168027/photo/india-goa-palolem-beach.jpg?s=612x612&w=0&k=20&c=iGV1Ue0Efj87dQirWnUpZVG1dNobUjfVvMGdKHTJ7Qg=';
      case 'DXB':
        return 'https://t4.ftcdn.net/jpg/02/44/69/29/360_F_244692979_t2oCOiISldR1fynEcARDEGr1jWEIF12z.jpg';
      case 'SIN':
        return 'https://t4.ftcdn.net/jpg/02/94/27/73/360_F_294277354_ev3qw00wjlHAfhqRdEozsrVRpbhixC3S.jpg';
      case 'DEL':
        return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVsaGl8ZW58MHx8MHx8fDA%3D';
      case 'LHR':
        return 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
      case 'JFK':
        return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
      default:
        return null;
    }
  }
  
  // Auto advance slides
  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    
    resetTimeout();
    
    timeoutRef.current = setTimeout(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => 
        prevIndex === updatedDestinations.length - 1 ? 0 : prevIndex + 1
      );
    }, SLIDE_DURATION);
    
    return () => resetTimeout();
  }, [currentIndex, updatedDestinations.length]);
  
  // Manual navigation
  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };
  
  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? updatedDestinations.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex === updatedDestinations.length - 1 ? 0 : prevIndex + 1
    );
  };

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0
      };
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => {
      return {
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0
      };
    }
  };

  return (
    <div className="relative overflow-hidden w-full">
      {/* Main Carousel */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[650px] w-full overflow-hidden rounded-2xl shadow-xl border border-emerald-500/30">
        {/* Emerald gradient glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-emerald-300/10 to-emerald-500/30 rounded-2xl blur-md z-0"></div>
        
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 }
            }}
            className="absolute w-full h-full z-10"
          >
            <div className="relative w-full h-full">
              {/* Background Image with subtle zoom animation */}
              <motion.div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${updatedDestinations[currentIndex].image})`
                }}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1.0 }}
                transition={{ duration: 6, ease: "easeOut" }}
              />
              
              {/* Edge Gradient Overlays instead of full coverage */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>
              
              {/* Add border gradients only */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-emerald-900/30 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-emerald-900/30 to-transparent"></div>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-emerald-900/30 to-transparent"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 z-10">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`${isDark ? 'bg-black/40' : 'bg-black/30'} backdrop-blur-md border border-white/10 rounded-xl p-5 md:p-6 max-w-2xl overflow-hidden relative`}
                >
                  {/* Subtle gradient shimmer effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 z-0 opacity-70 animate-shimmer"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start md:items-center justify-between mb-3 flex-col md:flex-row gap-3">
                      <div>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                          {updatedDestinations[currentIndex].name}
                        </h3>
                        <p className="text-emerald-300 text-base md:text-lg lg:text-xl font-medium mt-1">
                          {updatedDestinations[currentIndex].code}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "#047857" }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center justify-center px-4 py-2 md:px-5 md:py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium text-base shadow-lg shadow-emerald-700/30"
                      >
                        Explore
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 ml-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                      </motion.button>
                    </div>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="text-white text-base md:text-lg lg:text-xl max-w-xl"
                    >
                      {updatedDestinations[currentIndex].description}
                    </motion.p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Arrows - make larger */}
        <motion.button 
          onClick={goToPrevious}
          whileHover={{ scale: 1.1, backgroundColor: "rgb(16 185 129 / 0.7)" }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-emerald-500/70 transition-colors z-20 shadow-lg"
          aria-label="Previous destination"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </motion.button>
        
        <motion.button 
          onClick={goToNext}
          whileHover={{ scale: 1.1, backgroundColor: "rgb(16 185 129 / 0.7)" }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-emerald-500/70 transition-colors z-20 shadow-lg"
          aria-label="Next destination"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </motion.button>
      </div>
      
      {/* Indicators */}
      <div className="flex justify-center mt-4">
        {updatedDestinations.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`mx-1 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 w-12 h-3' 
                : `${isDark ? 'bg-gray-600' : 'bg-gray-300'} w-3 h-3 hover:bg-emerald-400`
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DestinationCarousel; 