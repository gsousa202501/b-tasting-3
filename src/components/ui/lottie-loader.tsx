import React from 'react';
import Lottie from 'lottie-react';

interface LottieLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Minimalist laboratory/tasting animation data
const labAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 90,
  "w": 200,
  "h": 200,
  "nm": "Lab Flask Animation",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Flask",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 100},
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [100, 100, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {"a": 0, "k": [100, 100, 100]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "el",
              "p": {"a": 0, "k": [0, 20]},
              "s": {"a": 0, "k": [60, 80]},
              "nm": "Flask Body"
            },
            {
              "ty": "rc",
              "p": {"a": 0, "k": [0, -30]},
              "s": {"a": 0, "k": [20, 40]},
              "r": {"a": 0, "k": 0},
              "nm": "Flask Neck"
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [0.96, 0.64, 0.11, 1]},
              "o": {"a": 0, "k": 100},
              "nm": "Fill"
            },
            {
              "ty": "st",
              "c": {"a": 0, "k": [0.58, 0.40, 0.06, 1]},
              "o": {"a": 0, "k": 100},
              "w": {"a": 0, "k": 3},
              "nm": "Stroke"
            }
          ],
          "nm": "Flask Shape"
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Liquid",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 80},
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [100, 110, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {
          "a": 1,
          "k": [
            {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 0, "s": [100]},
            {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 45, "s": [110]},
            {"t": 90, "s": [100]}
          ]
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "el",
              "p": {"a": 0, "k": [0, 0]},
              "s": {
                "a": 1,
                "k": [
                  {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 0, "s": [40, 30]},
                  {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 45, "s": [45, 35]},
                  {"t": 90, "s": [40, 30]}
                ]
              },
              "nm": "Liquid Shape"
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [0.11, 0.64, 0.96, 0.7]},
              "o": {"a": 0, "k": 100},
              "nm": "Liquid Fill"
            }
          ],
          "nm": "Liquid Group"
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    },
    {
      "ddd": 0,
      "ind": 3,
      "ty": 4,
      "nm": "Bubbles",
      "sr": 1,
      "ks": {
        "o": {
          "a": 1,
          "k": [
            {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 0, "s": [0]},
            {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 15, "s": [100]},
            {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 75, "s": [100]},
            {"t": 90, "s": [0]}
          ]
        },
        "r": {"a": 0, "k": 0},
        "p": {"a": 0, "k": [100, 100, 0]},
        "a": {"a": 0, "k": [0, 0, 0]},
        "s": {"a": 0, "k": [100, 100, 100]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "el",
              "p": {"a": 0, "k": [-10, 10]},
              "s": {"a": 0, "k": [4, 4]},
              "nm": "Bubble 1"
            },
            {
              "ty": "el",
              "p": {"a": 0, "k": [8, 5]},
              "s": {"a": 0, "k": [3, 3]},
              "nm": "Bubble 2"
            },
            {
              "ty": "el",
              "p": {"a": 0, "k": [0, -5]},
              "s": {"a": 0, "k": [2, 2]},
              "nm": "Bubble 3"
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [1, 1, 1, 0.8]},
              "o": {"a": 0, "k": 100},
              "nm": "Bubble Fill"
            }
          ],
          "nm": "Bubbles Group"
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    }
  ]
};

export function LottieLoader({ size = 'md', className = '' }: LottieLoaderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Lottie
        animationData={labAnimation}
        loop={true}
        autoplay={true}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}