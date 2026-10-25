import React from 'react';
import { uiAudio } from '../../lib/uiAudio';

export interface GameButtonProps {
  id?: string;
  label: string;
  image?: string;
  href?: string;
  isCta?: boolean;
  actionId?: string;
  onClick?: (actionId?: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const GameButton: React.FC<GameButtonProps> = ({
  id,
  label,
  image,
  href,
  isCta = false,
  actionId,
  onClick,
  className = '',
  style,
  children,
}) => {
  const handleMouseEnter = () => {
    uiAudio.playHoverTick();
  };

  const handleFocus = () => {
    uiAudio.playHoverTick();
  };

  const handleMouseDown = () => {
    uiAudio.playPressClack();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!href) {
      e.preventDefault();
      // Unwired button feedback: execute callback without side-effects or navigation
      if (onClick) {
        onClick(actionId);
      }
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
    touchAction: 'manipulation',
    transition: 'transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 160ms ease',
    outline: 'none',
    ...style,
  };

  if (href) {
    return (
      <a
        id={id}
        href={href}
        target="_self"
        rel="noopener"
        aria-label={label}
        style={baseStyle}
        className={`gameBtn ${isCta ? 'gameBtnCta' : 'gameBtnNav'} ${className}`}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        onMouseDown={handleMouseDown}
      >
        {image ? (
          <img
            src={image}
            alt={label}
            draggable={false}
            style={{ display: 'block', width: '100%', height: 'auto', pointerEvents: 'none' }}
          />
        ) : (
          children || label
        )}
      </a>
    );
  }

  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      style={baseStyle}
      className={`gameBtn ${isCta ? 'gameBtnCta' : 'gameBtnNav'} ${className}`}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {image ? (
        <img
          src={image}
          alt={label}
          draggable={false}
          style={{ display: 'block', width: '100%', height: 'auto', pointerEvents: 'none' }}
        />
      ) : (
        children || label
      )}
    </button>
  );
};
