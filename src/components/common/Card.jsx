import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext';

const Card = ({ children, className = '', withHover = false }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className={`
        glass-effect 
        ${withHover ? 'hover-card' : ''} 
        p-6 
        ${isDarkMode 
          ? 'shadow-lg shadow-purple-900/10' 
          : 'shadow-lg shadow-blue-900/5'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  withHover: PropTypes.bool,
};

export default Card; 