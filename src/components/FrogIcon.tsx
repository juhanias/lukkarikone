interface FrogIconProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export function FrogIcon({ className = '', style = {}, size = 24 }: FrogIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 121.1794 92.086845"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(-0.01018543,6.1066799e-4)">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          d="M 109.54115,36.538954 A 55.327297,34.387451 0 0 1 95.625412,79.205999 55.327297,34.387451 0 0 1 25.580528,79.203382 55.327297,34.387451 0 0 1 11.673043,36.535297"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          d="m 50.848209,18.735433 a 55.327297,34.387451 0 0 1 19.425553,-0.0099"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          d="M 10.377317,35.296999 A 23.437256,18.442432 0 0 1 7.2889044,15.321003 23.437256,18.442432 0 0 1 29.253292,5.0142758 23.437256,18.442432 0 0 1 50.119964,16.647873"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          d="M 70.849642,17.136088 A 23.437256,18.442432 0 0 1 91.510704,5.0325406 23.437256,18.442432 0 0 1 113.81776,15.166823 23.437256,18.442432 0 0 1 110.82744,35.298338"
        />
        <ellipse
          fill="currentColor"
          cx="28"
          cy="23"
          rx="15"
          ry="10"
        />
        <ellipse
          fill="currentColor"
          cx="93"
          cy="23"
          rx="15"
          ry="10"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          d="M 74.947076,45.791598 A 15.162805,8.3204432 0 0 1 60.6987,51.266282 15.162805,8.3204432 0 0 1 46.450324,45.791598"
        />
      </g>
    </svg>
  );
}
