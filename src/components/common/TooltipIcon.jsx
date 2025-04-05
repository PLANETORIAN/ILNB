import React, { useState } from 'react';
import { InfoIcon } from 'lucide-react';
import PropTypes from 'prop-types';

const TooltipIcon = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <InfoIcon
        className="w-4 h-4 text-gray-400 hover:text-purple-400 transition-colors cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -left-1/2 transform -translate-x-1/2 animate-fade-in glass-effect">
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2 -top-1 left-1/2" />
          {content}
        </div>
      )}
    </div>
  );
};

TooltipIcon.propTypes = {
  content: PropTypes.string.isRequired,
};

export default TooltipIcon; 