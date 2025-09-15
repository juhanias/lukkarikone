import frogSvg from '../assets/frog.svg';

interface FrogIconProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export function FrogIcon({ className = 'invert', style = {}, size = 24 }: FrogIconProps) {
  return (
    <img
      src={frogSvg}
      alt="Frog"
      className={className}
      style={{
        width: size,
        height: size,
        ...style
      }}
    />
  );
}
